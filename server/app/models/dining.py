import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database.base import Base


class OrderStatus(str, enum.Enum):
    placed = "placed"
    confirmed = "confirmed"
    preparing = "preparing"
    ready = "ready"
    served = "served"
    closed = "closed"
    cancelled = "cancelled"


class PaymentMethod(str, enum.Enum):
    online = "online"
    pay_at_table = "pay_at_table"


class PaymentStatus(str, enum.Enum):
    unpaid = "unpaid"
    pending = "pending"
    paid = "paid"


class StockReason(str, enum.Enum):
    restock = "restock"
    order_deduction = "order_deduction"
    waste = "waste"
    correction = "correction"


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)

    items = relationship("MenuItem", back_populates="category", order_by="MenuItem.sort_order")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String(512), nullable=True)
    is_available = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)
    allergens = Column(JSON, nullable=True)
    calories = Column(Integer, nullable=True)

    category = relationship("Category", back_populates="items")
    modifier_groups = relationship("ModifierGroup", back_populates="menu_item", cascade="all, delete-orphan")
    recipe = relationship("MenuItemIngredient", back_populates="menu_item", cascade="all, delete-orphan")


class ModifierGroup(Base):
    __tablename__ = "modifier_groups"

    id = Column(Integer, primary_key=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    is_required = Column(Boolean, nullable=False, default=False)
    min_select = Column(Integer, nullable=False, default=0)
    max_select = Column(Integer, nullable=False, default=1)

    menu_item = relationship("MenuItem", back_populates="modifier_groups")
    modifiers = relationship("Modifier", back_populates="group", cascade="all, delete-orphan")


class Modifier(Base):
    __tablename__ = "modifiers"

    id = Column(Integer, primary_key=True)
    modifier_group_id = Column(Integer, ForeignKey("modifier_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    price_delta = Column(Numeric(10, 2), nullable=False, default=0)

    group = relationship("ModifierGroup", back_populates="modifiers")


class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"

    id = Column(Integer, primary_key=True)
    label = Column(String(100), nullable=False)
    qr_code = Column(String(64), nullable=False, unique=True, index=True)
    is_active = Column(Boolean, nullable=False, default=True)

    orders = relationship("Order", back_populates="table")


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_table_id", "table_id"),
        Index("ix_orders_status", "status"),
        Index("ix_orders_created_at", "created_at"),
    )

    id = Column(Integer, primary_key=True)
    table_id = Column(Integer, ForeignKey("restaurant_tables.id", ondelete="RESTRICT"), nullable=False)
    status = Column(Enum(OrderStatus, native_enum=False), nullable=False, default=OrderStatus.placed)
    payment_method = Column(Enum(PaymentMethod, native_enum=False), nullable=False)
    payment_status = Column(Enum(PaymentStatus, native_enum=False), nullable=False, default=PaymentStatus.unpaid)
    subtotal = Column(Numeric(10, 2), nullable=False, default=0)
    tax = Column(Numeric(10, 2), nullable=False, default=0)
    total = Column(Numeric(10, 2), nullable=False, default=0)
    customer_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    table = relationship("RestaurantTable", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"
    __table_args__ = (Index("ix_order_items_order_id", "order_id"),)

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    selected_modifiers = Column(JSON, nullable=True)
    item_note = Column(Text, nullable=True)

    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    method = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    amount = Column(Numeric(10, 2), nullable=False)
    stripe_payment_intent_id = Column(String(255), nullable=True, unique=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)

    order = relationship("Order", back_populates="payments")


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False, unique=True)
    unit = Column(String(20), nullable=False, default="unit")
    current_quantity = Column(Float, nullable=False, default=0)
    low_stock_threshold = Column(Float, nullable=False, default=0)
    is_low_stock = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)

    recipe_links = relationship("MenuItemIngredient", back_populates="ingredient")
    adjustments = relationship("StockAdjustment", back_populates="ingredient")


class MenuItemIngredient(Base):
    __tablename__ = "menu_item_ingredients"
    __table_args__ = (
        Index("ix_menu_item_ingredients_menu_item_id", "menu_item_id"),
        Index("ix_menu_item_ingredients_ingredient_id", "ingredient_id"),
    )

    id = Column(Integer, primary_key=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    quantity_used = Column(Float, nullable=False)

    menu_item = relationship("MenuItem", back_populates="recipe")
    ingredient = relationship("Ingredient", back_populates="recipe_links")


class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"
    __table_args__ = (Index("ix_stock_adjustments_ingredient_id", "ingredient_id"),)

    id = Column(Integer, primary_key=True)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    change_amount = Column(Float, nullable=False)
    reason = Column(Enum(StockReason, native_enum=False), nullable=False)
    staff_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    ingredient = relationship("Ingredient", back_populates="adjustments")
