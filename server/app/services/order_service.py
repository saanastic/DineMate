from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.dining import (
    MenuItem,
    Modifier,
    ModifierGroup,
    Order,
    OrderItem,
    OrderStatus,
    Payment,
    PaymentMethod,
    PaymentStatus,
    RestaurantTable,
)
from app.schemas.dining import AddItemsInput, OrderCreate, OrderItemInput
from app.services.stock_service import deduct_stock_for_order
from app.utils.cache import get_redis

VALID_TRANSITIONS = {
    OrderStatus.placed: {OrderStatus.confirmed, OrderStatus.cancelled},
    OrderStatus.confirmed: {OrderStatus.preparing, OrderStatus.cancelled},
    OrderStatus.preparing: {OrderStatus.ready, OrderStatus.cancelled},
    OrderStatus.ready: {OrderStatus.served, OrderStatus.cancelled},
    OrderStatus.served: {OrderStatus.closed},
    OrderStatus.closed: set(),
    OrderStatus.cancelled: set(),
}

OPEN_STATUSES = {OrderStatus.placed, OrderStatus.confirmed, OrderStatus.preparing, OrderStatus.ready, OrderStatus.served}


def _calc_line(db: Session, item_in: OrderItemInput) -> tuple[OrderItem, Decimal]:
    item = (
        db.query(MenuItem)
        .options(selectinload(MenuItem.modifier_groups).selectinload(ModifierGroup.modifiers))
        .filter(MenuItem.id == item_in.menu_item_id, MenuItem.is_available.is_(True))
        .first()
    )
    if not item:
        raise ValueError(f"Menu item {item_in.menu_item_id} unavailable")

    modifier_map: dict[int, Modifier] = {}
    group_rules: dict[int, ModifierGroup] = {}
    for g in item.modifier_groups:
        group_rules[g.id] = g
        for m in g.modifiers:
            modifier_map[m.id] = m

    selected = [modifier_map[mid] for mid in item_in.selected_modifier_ids if mid in modifier_map]
    if len(selected) != len(item_in.selected_modifier_ids):
        raise ValueError("Invalid modifier selection")

    by_group: dict[int, list[Modifier]] = {}
    for m in selected:
        by_group.setdefault(m.modifier_group_id, []).append(m)

    for gid, group in group_rules.items():
        count = len(by_group.get(gid, []))
        if group.is_required and count < max(group.min_select, 1):
            raise ValueError(f"Modifier group '{group.name}' requires at least {group.min_select} selection(s)")
        if count < group.min_select or count > group.max_select:
            raise ValueError(f"Modifier group '{group.name}' requires {group.min_select}-{group.max_select} selections")

    mod_total = sum(Decimal(str(m.price_delta)) for m in selected)
    unit_price = Decimal(str(item.price)) + mod_total
    snapshot = [{"id": m.id, "name": m.name, "price_delta": str(m.price_delta)} for m in selected]

    line = OrderItem(
        menu_item_id=item.id,
        item_name=item.name,
        quantity=item_in.quantity,
        unit_price=unit_price,
        selected_modifiers=snapshot,
        item_note=item_in.item_note,
    )
    return line, unit_price * item_in.quantity


def _build_lines(db: Session, items: list[OrderItemInput]) -> tuple[list[OrderItem], Decimal]:
    lines: list[OrderItem] = []
    subtotal = Decimal("0")
    for item_in in items:
        line, line_total = _calc_line(db, item_in)
        lines.append(line)
        subtotal += line_total
    return lines, subtotal


def create_order(db: Session, data: OrderCreate) -> Order:
    if data.idempotency_key:
        r = get_redis()
        existing_id = r.get(f"order:idempotency:{data.idempotency_key}")
        if existing_id:
            order = get_order(db, int(existing_id))
            if order:
                return order

    table = db.query(RestaurantTable).filter(
        RestaurantTable.id == data.table_id, RestaurantTable.is_active.is_(True)
    ).first()
    if not table:
        raise ValueError("Invalid or inactive table")

    if not data.items:
        raise ValueError("Order must contain at least one item")

    try:
        payment_method = PaymentMethod(data.payment_method)
    except ValueError:
        raise ValueError("Invalid payment method")

    lines, subtotal = _build_lines(db, data.items)
    tax = (subtotal * Decimal(str(settings.TAX_RATE))).quantize(Decimal("0.01"))
    total = subtotal + tax

    payment_status = PaymentStatus.unpaid
    if payment_method == PaymentMethod.online:
        payment_status = PaymentStatus.unpaid

    order = Order(
        table_id=table.id,
        status=OrderStatus.placed,
        payment_method=payment_method,
        payment_status=payment_status,
        subtotal=subtotal,
        tax=tax,
        total=total,
        customer_note=data.customer_note,
    )
    db.add(order)
    db.flush()

    for line in lines:
        line.order_id = order.id
        db.add(line)

    line_items = [(ln.menu_item_id, ln.quantity) for ln in lines if ln.menu_item_id]
    alerts = deduct_stock_for_order(db, order.id, line_items)

    db.commit()
    db.refresh(order)

    if data.idempotency_key:
        get_redis().setex(f"order:idempotency:{data.idempotency_key}", 3600, str(order.id))

    order._stock_alerts = alerts  # type: ignore[attr-defined]
    return order


def add_items_to_order(db: Session, order_id: int, data: AddItemsInput) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise ValueError("Order not found")
    if order.status not in OPEN_STATUSES:
        raise ValueError("Cannot add items to a closed order")

    lines, added_subtotal = _build_lines(db, data.items)
    for line in lines:
        line.order_id = order.id
        db.add(line)

    order.subtotal = Decimal(str(order.subtotal)) + added_subtotal
    order.tax = (order.subtotal * Decimal(str(settings.TAX_RATE))).quantize(Decimal("0.01"))
    order.total = order.subtotal + order.tax

    line_items = [(ln.menu_item_id, ln.quantity) for ln in lines if ln.menu_item_id]
    alerts = deduct_stock_for_order(db, order.id, line_items)

    db.commit()
    db.refresh(order)
    order._stock_alerts = alerts  # type: ignore[attr-defined]
    return order


def get_order(db: Session, order_id: int) -> Order | None:
    return (
        db.query(Order)
        .options(selectinload(Order.items), selectinload(Order.table))
        .filter(Order.id == order_id)
        .first()
    )


def list_orders(
    db: Session,
    status: str | None = None,
    table_id: int | None = None,
    date: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[Order], int]:
    q = db.query(Order).options(selectinload(Order.items), selectinload(Order.table))
    if status:
        q = q.filter(Order.status == OrderStatus(status))
    if table_id:
        q = q.filter(Order.table_id == table_id)
    if date:
        q = q.filter(Order.created_at >= datetime.fromisoformat(date))
    total = q.count()
    orders = q.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return orders, total


def update_order_status(db: Session, order_id: int, new_status: str) -> Order | None:
    order = get_order(db, order_id)
    if not order:
        return None
    target = OrderStatus(new_status)
    allowed = VALID_TRANSITIONS.get(order.status, set())
    if target not in allowed:
        raise ValueError(f"Cannot transition from {order.status.value} to {target.value}")
    order.status = target
    db.commit()
    db.refresh(order)
    return order


def mark_order_paid(db: Session, order_id: int) -> Order | None:
    order = get_order(db, order_id)
    if not order:
        return None
    if order.payment_status == PaymentStatus.paid:
        return order
    order.payment_status = PaymentStatus.paid
    db.commit()
    db.refresh(order)
    return order


def create_stripe_payment_intent(db: Session, order_id: int) -> tuple[str, str]:
    import stripe

    order = get_order(db, order_id)
    if not order:
        raise ValueError("Order not found")
    if order.payment_method != PaymentMethod.online:
        raise ValueError("Order is not an online payment order")
    if order.payment_status == PaymentStatus.paid:
        raise ValueError("Order already paid")

    stripe.api_key = settings.STRIPE_SECRET_KEY
    if not stripe.api_key:
        raise ValueError("Stripe not configured")

    intent = stripe.PaymentIntent.create(
        amount=int(Decimal(str(order.total)) * 100),
        currency="usd",
        metadata={"order_id": str(order.id)},
    )

    payment = Payment(
        order_id=order.id,
        method="online",
        status="pending",
        amount=order.total,
        stripe_payment_intent_id=intent.id,
    )
    order.payment_status = PaymentStatus.pending
    db.add(payment)
    db.commit()

    return intent.client_secret, intent.id


def handle_stripe_webhook(db: Session, payload: bytes, sig_header: str) -> bool:
    import stripe

    stripe.api_key = settings.STRIPE_SECRET_KEY
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except Exception:
        return False

    if event["type"] == "payment_intent.succeeded":
        pi = event["data"]["object"]
        payment = db.query(Payment).filter(Payment.stripe_payment_intent_id == pi["id"]).first()
        if payment:
            payment.status = "paid"
            payment.paid_at = datetime.now(timezone.utc)
            order = db.query(Order).filter(Order.id == payment.order_id).first()
            if order:
                order.payment_status = PaymentStatus.paid
            db.commit()
            return True
    return False


def order_to_dict(order: Order) -> dict:
    return {
        "id": order.id,
        "table_id": order.table_id,
        "table_label": order.table.label if order.table else None,
        "status": order.status.value if hasattr(order.status, "value") else order.status,
        "payment_method": order.payment_method.value if hasattr(order.payment_method, "value") else order.payment_method,
        "payment_status": order.payment_status.value if hasattr(order.payment_status, "value") else order.payment_status,
        "subtotal": str(order.subtotal),
        "tax": str(order.tax),
        "total": str(order.total),
        "customer_note": order.customer_note,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        "items": [
            {
                "id": i.id,
                "menu_item_id": i.menu_item_id,
                "item_name": i.item_name,
                "quantity": i.quantity,
                "unit_price": str(i.unit_price),
                "selected_modifiers": i.selected_modifiers,
                "item_note": i.item_note,
            }
            for i in order.items
        ],
    }


def get_analytics_summary(db: Session) -> dict:
    from sqlalchemy import func
    from app.models.dining import Ingredient

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = db.query(Order).filter(Order.created_at >= today_start).count()
    today_revenue = (
        db.query(func.coalesce(func.sum(Order.total), 0))
        .filter(Order.created_at >= today_start, Order.payment_status == PaymentStatus.paid)
        .scalar()
    )
    top_items = (
        db.query(OrderItem.item_name, func.sum(OrderItem.quantity).label("qty"))
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.created_at >= today_start)
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
        .all()
    )
    low_stock_count = db.query(Ingredient).filter(Ingredient.is_low_stock.is_(True)).count()
    return {
        "today_orders": today_orders,
        "today_revenue": str(today_revenue or 0),
        "top_items": [{"name": n, "quantity": int(q)} for n, q in top_items],
        "low_stock_count": low_stock_count,
    }
