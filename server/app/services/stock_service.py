from sqlalchemy.orm import Session

from app.models.dining import Ingredient, MenuItem, MenuItemIngredient, StockAdjustment, StockReason


def apply_stock_change(
    db: Session,
    ingredient: Ingredient,
    change_amount: float,
    reason: StockReason,
    staff_user_id: int | None = None,
    order_id: int | None = None,
) -> tuple[Ingredient, bool, list[int]]:
    was_low = ingredient.is_low_stock
    ingredient.current_quantity = max(0, ingredient.current_quantity + change_amount)
    now_low = ingredient.current_quantity <= ingredient.low_stock_threshold
    newly_low = not was_low and now_low
    ingredient.is_low_stock = now_low

    adj = StockAdjustment(
        ingredient_id=ingredient.id,
        change_amount=change_amount,
        reason=reason,
        staff_user_id=staff_user_id,
        order_id=order_id,
    )
    db.add(adj)
    db.add(ingredient)

    unavailable_ids: list[int] = []
    if ingredient.current_quantity <= 0:
        unavailable_ids = _auto_86_items(db, ingredient.id)

    db.flush()
    return ingredient, newly_low, unavailable_ids


def deduct_stock_for_order(db: Session, order_id: int, line_items: list[tuple[int, int]]) -> list[dict]:
    """
    line_items: list of (menu_item_id, quantity)
    Returns list of low-stock alert payloads {ingredient_id, name, current_quantity, threshold}
    """
    alerts: list[dict] = []
    unavailable: list[int] = []

    qty_by_item: dict[int, int] = {}
    for menu_item_id, qty in line_items:
        qty_by_item[menu_item_id] = qty_by_item.get(menu_item_id, 0) + qty

    for menu_item_id, qty in qty_by_item.items():
        recipe = (
            db.query(MenuItemIngredient)
            .filter(MenuItemIngredient.menu_item_id == menu_item_id)
            .all()
        )
        for link in recipe:
            ing = db.query(Ingredient).filter(Ingredient.id == link.ingredient_id, Ingredient.is_active.is_(True)).first()
            if not ing:
                continue
            deduction = -link.quantity_used * qty
            _, newly_low, unavail = apply_stock_change(
                db, ing, deduction, StockReason.order_deduction, order_id=order_id
            )
            if newly_low:
                alerts.append(
                    {
                        "ingredient_id": ing.id,
                        "name": ing.name,
                        "current_quantity": ing.current_quantity,
                        "threshold": ing.low_stock_threshold,
                    }
                )
            unavailable.extend(unavail)

    return alerts


def _auto_86_items(db: Session, ingredient_id: int) -> list[int]:
    links = db.query(MenuItemIngredient).filter(MenuItemIngredient.ingredient_id == ingredient_id).all()
    ids = []
    for link in links:
        item = db.query(MenuItem).filter(MenuItem.id == link.menu_item_id).first()
        if item and item.is_available:
            item.is_available = False
            ids.append(item.id)
    if ids:
        from app.utils.menu_cache import invalidate_menu_cache

        invalidate_menu_cache()
    return ids
