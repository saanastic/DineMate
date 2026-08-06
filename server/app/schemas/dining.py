from decimal import Decimal
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field


# ── Modifiers ──────────────────────────────────────────────────────────

class ModifierOut(BaseModel):
    id: int
    name: str
    price_delta: Decimal

    model_config = ConfigDict(from_attributes=True)


class ModifierGroupOut(BaseModel):
    id: int
    name: str
    is_required: bool
    min_select: int
    max_select: int
    modifiers: list[ModifierOut] = []

    model_config = ConfigDict(from_attributes=True)


class ModifierGroupCreate(BaseModel):
    name: str
    is_required: bool = False
    min_select: int = 0
    max_select: int = 1


class ModifierCreate(BaseModel):
    name: str
    price_delta: Decimal = Decimal("0")


# ── Menu ───────────────────────────────────────────────────────────────

class MenuItemOut(BaseModel):
    id: int
    category_id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    image_url: Optional[str] = None
    is_available: bool
    sort_order: int
    allergens: Optional[list[str]] = None
    calories: Optional[int] = None
    modifier_groups: list[ModifierGroupOut] = []

    model_config = ConfigDict(from_attributes=True)


class MenuItemCreate(BaseModel):
    category_id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    image_url: Optional[str] = None
    is_available: bool = True
    sort_order: int = 0
    allergens: Optional[list[str]] = None
    calories: Optional[int] = None


class MenuItemUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    sort_order: Optional[int] = None
    allergens: Optional[list[str]] = None
    calories: Optional[int] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    sort_order: int
    is_active: bool
    items: list[MenuItemOut] = []

    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


# ── Tables ─────────────────────────────────────────────────────────────

class TableOut(BaseModel):
    id: int
    label: str
    qr_code: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TableCreate(BaseModel):
    label: str
    is_active: bool = True


class TableUpdate(BaseModel):
    label: Optional[str] = None
    is_active: Optional[bool] = None


# ── Orders ─────────────────────────────────────────────────────────────

class OrderItemInput(BaseModel):
    menu_item_id: int
    quantity: int = Field(gt=0)
    selected_modifier_ids: list[int] = []
    item_note: Optional[str] = None


class OrderCreate(BaseModel):
    table_id: int
    items: list[OrderItemInput]
    payment_method: str
    customer_note: Optional[str] = None
    idempotency_key: Optional[str] = None


class OrderItemOut(BaseModel):
    id: int
    menu_item_id: Optional[int] = None
    item_name: str
    quantity: int
    unit_price: Decimal
    selected_modifiers: Optional[list[Any]] = None
    item_note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    table_id: int
    status: str
    payment_method: str
    payment_status: str
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    customer_note: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: list[OrderItemOut] = []
    table_label: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    status: str


class AddItemsInput(BaseModel):
    items: list[OrderItemInput]


class PaymentIntentOut(BaseModel):
    client_secret: str
    payment_intent_id: str


# ── Inventory ──────────────────────────────────────────────────────────

class IngredientOut(BaseModel):
    id: int
    name: str
    unit: str
    current_quantity: float
    low_stock_threshold: float
    is_low_stock: bool
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class IngredientCreate(BaseModel):
    name: str
    unit: str = "unit"
    current_quantity: float = 0
    low_stock_threshold: float = 0
    is_active: bool = True


class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    low_stock_threshold: Optional[float] = None
    is_active: Optional[bool] = None


class StockAdjustInput(BaseModel):
    change_amount: float
    reason: str


class MenuItemIngredientOut(BaseModel):
    id: int
    menu_item_id: int
    ingredient_id: int
    quantity_used: float
    ingredient_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MenuItemIngredientCreate(BaseModel):
    ingredient_id: int
    quantity_used: float


class AnalyticsSummary(BaseModel):
    today_orders: int
    today_revenue: Decimal
    top_items: list[dict]
    low_stock_count: int


class PaginatedOrders(BaseModel):
    items: list[OrderOut]
    total: int
    page: int
    page_size: int


class PaginatedIngredients(BaseModel):
    items: list[IngredientOut]
    total: int
    page: int
    page_size: int
