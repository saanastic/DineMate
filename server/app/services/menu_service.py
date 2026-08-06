import json
import secrets
from decimal import Decimal

from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.dining import (
    Category,
    Ingredient,
    MenuItem,
    MenuItemIngredient,
    Modifier,
    ModifierGroup,
    RestaurantTable,
    StockAdjustment,
    StockReason,
)
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
    StockAdjustInput,
    TableCreate,
    TableUpdate,
)
from app.utils.cache import get_redis
from app.utils.menu_cache import MENU_CACHE_KEY, invalidate_menu_cache


def _menu_query(db: Session):
    return (
        db.query(Category)
        .filter(Category.is_active.is_(True))
        .options(
            selectinload(Category.items)
            .selectinload(MenuItem.modifier_groups)
            .selectinload(ModifierGroup.modifiers)
        )
        .order_by(Category.sort_order, Category.id)
    )


def get_public_menu(db: Session) -> list[Category]:
    r = get_redis()
    cached = r.get(MENU_CACHE_KEY)
    if cached:
        data = json.loads(cached)
        return data

    categories = _menu_query(db).all()
    payload = []
    for cat in categories:
        items = []
        for item in sorted(cat.items, key=lambda i: (i.sort_order, i.id)):
            if not item.is_available:
                continue
            groups = []
            for g in item.modifier_groups:
                groups.append(
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
                )
            items.append(
                {
                    "id": item.id,
                    "category_id": item.category_id,
                    "name": item.name,
                    "description": item.description,
                    "price": str(item.price),
                    "image_url": item.image_url,
                    "is_available": item.is_available,
                    "sort_order": item.sort_order,
                    "allergens": item.allergens,
                    "calories": item.calories,
                    "modifier_groups": groups,
                }
            )
        payload.append(
            {
                "id": cat.id,
                "name": cat.name,
                "description": cat.description,
                "sort_order": cat.sort_order,
                "is_active": cat.is_active,
                "items": items,
            }
        )
    r.setex(MENU_CACHE_KEY, settings.MENU_CACHE_TTL, json.dumps(payload))
    return payload


# ── Categories ─────────────────────────────────────────────────────────

def list_categories(db: Session) -> list[Category]:
    return (
        db.query(Category)
        .options(
            selectinload(Category.items)
            .selectinload(MenuItem.modifier_groups)
            .selectinload(ModifierGroup.modifiers)
        )
        .order_by(Category.sort_order, Category.id)
        .all()
    )


def create_category(db: Session, data: CategoryCreate) -> Category:
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    invalidate_menu_cache()
    return cat


def update_category(db: Session, cat_id: int, data: CategoryUpdate) -> Category | None:
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    invalidate_menu_cache()
    return cat


def delete_category(db: Session, cat_id: int) -> bool:
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if not cat:
        return False
    db.delete(cat)
    db.commit()
    invalidate_menu_cache()
    return True


# ── Menu items ─────────────────────────────────────────────────────────

def create_menu_item(db: Session, data: MenuItemCreate) -> MenuItem:
    item = MenuItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    invalidate_menu_cache()
    return item


def update_menu_item(db: Session, item_id: int, data: MenuItemUpdate) -> MenuItem | None:
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    invalidate_menu_cache()
    return item


def delete_menu_item(db: Session, item_id: int) -> bool:
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        return False
    db.delete(item)
    db.commit()
    invalidate_menu_cache()
    return True


def add_modifier_group(db: Session, item_id: int, data: ModifierGroupCreate) -> ModifierGroup | None:
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        return None
    group = ModifierGroup(menu_item_id=item_id, **data.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    invalidate_menu_cache()
    return group


def add_modifier(db: Session, group_id: int, data: ModifierCreate) -> Modifier | None:
    group = db.query(ModifierGroup).filter(ModifierGroup.id == group_id).first()
    if not group:
        return None
    mod = Modifier(modifier_group_id=group_id, **data.model_dump())
    db.add(mod)
    db.commit()
    db.refresh(mod)
    invalidate_menu_cache()
    return mod


def set_menu_item_ingredients(
    db: Session, item_id: int, links: list[MenuItemIngredientCreate]
) -> list[MenuItemIngredient]:
    db.query(MenuItemIngredient).filter(MenuItemIngredient.menu_item_id == item_id).delete()
    created = []
    for link in links:
        row = MenuItemIngredient(menu_item_id=item_id, **link.model_dump())
        db.add(row)
        created.append(row)
    db.commit()
    return created


def get_menu_item_ingredients(db: Session, item_id: int) -> list[dict]:
    rows = (
        db.query(MenuItemIngredient, Ingredient.name)
        .join(Ingredient, Ingredient.id == MenuItemIngredient.ingredient_id)
        .filter(MenuItemIngredient.menu_item_id == item_id)
        .all()
    )
    return [
        {
            "id": r.MenuItemIngredient.id,
            "menu_item_id": r.MenuItemIngredient.menu_item_id,
            "ingredient_id": r.MenuItemIngredient.ingredient_id,
            "quantity_used": r.MenuItemIngredient.quantity_used,
            "ingredient_name": r.name,
        }
        for r in rows
    ]


# ── Tables ─────────────────────────────────────────────────────────────

def list_tables(db: Session) -> list[RestaurantTable]:
    return db.query(RestaurantTable).order_by(RestaurantTable.id).all()


def get_table_by_qr(db: Session, qr_code: str) -> RestaurantTable | None:
    return db.query(RestaurantTable).filter(RestaurantTable.qr_code == qr_code).first()


def create_table(db: Session, data: TableCreate) -> RestaurantTable:
    table = RestaurantTable(label=data.label, qr_code=secrets.token_urlsafe(16), is_active=data.is_active)
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


def update_table(db: Session, table_id: int, data: TableUpdate) -> RestaurantTable | None:
    table = db.query(RestaurantTable).filter(RestaurantTable.id == table_id).first()
    if not table:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(table, k, v)
    db.commit()
    db.refresh(table)
    return table


def delete_table(db: Session, table_id: int) -> bool:
    table = db.query(RestaurantTable).filter(RestaurantTable.id == table_id).first()
    if not table:
        return False
    db.delete(table)
    db.commit()
    return True


# ── Ingredients ────────────────────────────────────────────────────────

def list_ingredients(
    db: Session, page: int = 1, page_size: int = 50, low_stock_only: bool = False
) -> tuple[list[Ingredient], int]:
    q = db.query(Ingredient).filter(Ingredient.is_active.is_(True))
    if low_stock_only:
        q = q.filter(Ingredient.is_low_stock.is_(True))
    total = q.count()
    items = q.order_by(Ingredient.name).offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def create_ingredient(db: Session, data: IngredientCreate) -> Ingredient:
    ing = Ingredient(**data.model_dump())
    if ing.current_quantity <= ing.low_stock_threshold:
        ing.is_low_stock = True
    db.add(ing)
    db.commit()
    db.refresh(ing)
    return ing


def update_ingredient(db: Session, ing_id: int, data: IngredientUpdate) -> Ingredient | None:
    ing = db.query(Ingredient).filter(Ingredient.id == ing_id).first()
    if not ing:
        return None
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(ing, k, v)
    ing.is_low_stock = ing.current_quantity <= ing.low_stock_threshold
    db.commit()
    db.refresh(ing)
    return ing


def adjust_stock(
    db: Session,
    ing_id: int,
    data: StockAdjustInput,
    staff_user_id: int | None = None,
    order_id: int | None = None,
) -> tuple[Ingredient | None, bool, list[int]]:
    """Returns (ingredient, newly_low, unavailable_menu_item_ids)."""
    from app.services.stock_service import apply_stock_change

    ing = db.query(Ingredient).filter(Ingredient.id == ing_id, Ingredient.is_active.is_(True)).first()
    if not ing:
        return None, False, []
    reason = StockReason(data.reason)
    return apply_stock_change(db, ing, data.change_amount, reason, staff_user_id, order_id)
