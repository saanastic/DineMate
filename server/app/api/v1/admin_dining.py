import io

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.schemas.dining import (
    CategoryCreate,
    CategoryUpdate,
    IngredientCreate,
    IngredientUpdate,
    MenuItemCreate,
    MenuItemIngredientCreate,
    MenuItemUpdate,
    ModifierCreate,
    ModifierGroupCreate,
    OrderStatusUpdate,
    StockAdjustInput,
    TableCreate,
    TableUpdate,
)
from app.security.dependencies import require_roles
from app.services import menu_service, order_service
from app.utils.ws_manager import ws_manager

router = APIRouter()
STAFF_ROLES = ("admin", "manager", "waiter", "chef")


# ── Categories ─────────────────────────────────────────────────────────

@router.get("/categories")
def admin_list_categories(db: Session = Depends(get_db), _=Depends(require_roles(*STAFF_ROLES))):
    cats = menu_service.list_categories(db)
    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "sort_order": c.sort_order,
            "is_active": c.is_active,
            "items": [
                {
                    "id": i.id,
                    "category_id": i.category_id,
                    "name": i.name,
                    "description": i.description,
                    "price": str(i.price),
                    "image_url": i.image_url,
                    "is_available": i.is_available,
                    "sort_order": i.sort_order,
                    "allergens": i.allergens,
                    "calories": i.calories,
                    "modifier_groups": [
                        {
                            "id": g.id,
                            "name": g.name,
                            "is_required": g.is_required,
                            "min_select": g.min_select,
                            "max_select": g.max_select,
                            "modifiers": [
                                {"id": m.id, "name": m.name, "price_delta": str(m.price_delta)}
                                for m in g.modifiers
                            ],
                        }
                        for g in i.modifier_groups
                    ],
                }
                for i in c.items
            ],
        }
        for c in cats
    ]


@router.post("/categories")
def admin_create_category(data: CategoryCreate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    cat = menu_service.create_category(db, data)
    return {"id": cat.id, "name": cat.name}


@router.patch("/categories/{cat_id}")
def admin_update_category(cat_id: int, data: CategoryUpdate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    cat = menu_service.update_category(db, cat_id, data)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"id": cat.id, "name": cat.name}


@router.delete("/categories/{cat_id}")
def admin_delete_category(cat_id: int, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    if not menu_service.delete_category(db, cat_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return {"ok": True}


# ── Menu items ─────────────────────────────────────────────────────────

@router.post("/menu-items")
def admin_create_item(data: MenuItemCreate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    item = menu_service.create_menu_item(db, data)
    return {"id": item.id, "name": item.name}


@router.patch("/menu-items/{item_id}")
def admin_update_item(item_id: int, data: MenuItemUpdate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    item = menu_service.update_menu_item(db, item_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"id": item.id, "name": item.name}


@router.delete("/menu-items/{item_id}")
def admin_delete_item(item_id: int, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    if not menu_service.delete_menu_item(db, item_id):
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"ok": True}


@router.post("/menu-items/{item_id}/modifier-groups")
def admin_add_modifier_group(item_id: int, data: ModifierGroupCreate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    group = menu_service.add_modifier_group(db, item_id, data)
    if not group:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return {"id": group.id, "name": group.name}


@router.post("/menu-items/{item_id}/modifier-groups/{group_id}/modifiers")
def admin_add_modifier(item_id: int, group_id: int, data: ModifierCreate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    mod = menu_service.add_modifier(db, group_id, data)
    if not mod:
        raise HTTPException(status_code=404, detail="Modifier group not found")
    return {"id": mod.id, "name": mod.name}


@router.get("/menu-items/{item_id}/ingredients")
def admin_get_recipe(item_id: int, db: Session = Depends(get_db), _=Depends(require_roles(*STAFF_ROLES))):
    return menu_service.get_menu_item_ingredients(db, item_id)


@router.put("/menu-items/{item_id}/ingredients")
def admin_set_recipe(item_id: int, links: list[MenuItemIngredientCreate], db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    return menu_service.set_menu_item_ingredients(db, item_id, links)


# ── Tables ─────────────────────────────────────────────────────────────

@router.get("/tables")
def admin_list_tables(db: Session = Depends(get_db), _=Depends(require_roles(*STAFF_ROLES))):
    tables = menu_service.list_tables(db)
    return [{"id": t.id, "label": t.label, "qr_code": t.qr_code, "is_active": t.is_active, "url": f"{settings.FRONTEND_URL}/table/{t.qr_code}"} for t in tables]


@router.post("/tables")
def admin_create_table(data: TableCreate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    table = menu_service.create_table(db, data)
    return {"id": table.id, "label": table.label, "qr_code": table.qr_code, "url": f"{settings.FRONTEND_URL}/table/{table.qr_code}"}


@router.patch("/tables/{table_id}")
def admin_update_table(table_id: int, data: TableUpdate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    table = menu_service.update_table(db, table_id, data)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return {"id": table.id, "label": table.label}


@router.delete("/tables/{table_id}")
def admin_delete_table(table_id: int, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    if not menu_service.delete_table(db, table_id):
        raise HTTPException(status_code=404, detail="Table not found")
    return {"ok": True}


@router.get("/tables/{table_id}/qr")
def admin_table_qr(
    table_id: int,
    token: str | None = Query(None),
    db: Session = Depends(get_db),
    user=Depends(require_roles(*STAFF_ROLES)),
):
    _ = user  # auth via dependency; token query reserved for future img-tag use
    tables = menu_service.list_tables(db)
    table = next((t for t in tables if t.id == table_id), None)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    url = f"{settings.FRONTEND_URL}/table/{table.qr_code}"
    img = qrcode.make(url)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")


# ── Orders ─────────────────────────────────────────────────────────────

@router.get("/orders")
def admin_list_orders(
    status: str | None = None,
    table_id: int | None = None,
    date: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_roles(*STAFF_ROLES)),
):
    orders, total = order_service.list_orders(db, status, table_id, date, page, page_size)
    return {
        "items": [order_service.order_to_dict(o) for o in orders],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.patch("/orders/{order_id}/status")
async def admin_update_status(order_id: int, data: OrderStatusUpdate, db: Session = Depends(get_db), _=Depends(require_roles(*STAFF_ROLES))):
    try:
        order = order_service.update_order_status(db, order_id, data.status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    payload = {"id": order.id, "status": order.status.value, "table_id": order.table_id}
    await ws_manager.notify_table(order.table_id, "order_status", payload)
    await ws_manager.notify_admin("order_status", payload)
    return order_service.order_to_dict(order)


@router.patch("/orders/{order_id}/mark-paid")
async def admin_mark_paid(order_id: int, db: Session = Depends(get_db), _=Depends(require_roles(*STAFF_ROLES))):
    order = order_service.mark_order_paid(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    payload = {"id": order.id, "payment_status": "paid"}
    await ws_manager.notify_table(order.table_id, "payment_status", payload)
    return order_service.order_to_dict(order)


# ── Ingredients ────────────────────────────────────────────────────────

@router.get("/ingredients")
def admin_list_ingredients(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    low_stock_only: bool = False,
    db: Session = Depends(get_db),
    _=Depends(require_roles(*STAFF_ROLES)),
):
    items, total = menu_service.list_ingredients(db, page, page_size, low_stock_only)
    return {
        "items": [
            {
                "id": i.id,
                "name": i.name,
                "unit": i.unit,
                "current_quantity": i.current_quantity,
                "low_stock_threshold": i.low_stock_threshold,
                "is_low_stock": i.is_low_stock,
                "is_active": i.is_active,
            }
            for i in items
        ],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("/ingredients")
def admin_create_ingredient(data: IngredientCreate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    ing = menu_service.create_ingredient(db, data)
    return {"id": ing.id, "name": ing.name}


@router.patch("/ingredients/{ing_id}")
def admin_update_ingredient(ing_id: int, data: IngredientUpdate, db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    ing = menu_service.update_ingredient(db, ing_id, data)
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return {"id": ing.id, "name": ing.name}


@router.post("/ingredients/{ing_id}/adjust")
async def admin_adjust_stock(ing_id: int, data: StockAdjustInput, db: Session = Depends(get_db), user=Depends(require_roles(*STAFF_ROLES))):
    ing, newly_low, _ = menu_service.adjust_stock(db, ing_id, data, staff_user_id=user.id)
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    if newly_low:
        await ws_manager.notify_admin(
            "low_stock",
            {
                "ingredient_id": ing.id,
                "name": ing.name,
                "current_quantity": ing.current_quantity,
                "threshold": ing.low_stock_threshold,
            },
        )
    return {
        "id": ing.id,
        "current_quantity": ing.current_quantity,
        "is_low_stock": ing.is_low_stock,
    }


# ── Analytics ──────────────────────────────────────────────────────────

@router.get("/analytics/summary")
def admin_analytics(db: Session = Depends(get_db), _=Depends(require_roles("admin", "manager"))):
    return order_service.get_analytics_summary(db)
