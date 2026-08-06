"""Seed demo menu, tables, ingredients, and admin credentials for local development."""
import os
import sys
from decimal import Decimal

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.session import SessionLocal
from app.models.dining import Category, Ingredient, MenuItem, MenuItemIngredient, RestaurantTable
from app.models.user import User
from app.security.auth import get_password_hash


def seed():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@dinemate.com").first()
        if not admin:
            admin = User(
                email="admin@dinemate.com",
                full_name="Demo Admin",
                hashed_password=get_password_hash("admin123"),
                role="admin",
            )
            db.add(admin)

        categories = [
            {"name": "Starters", "description": "Light bites to start the meal", "sort_order": 1},
            {"name": "Mains", "description": "Signature plates and bowls", "sort_order": 2},
            {"name": "Desserts", "description": "Sweet finishes", "sort_order": 3},
            {"name": "Drinks", "description": "House beverages", "sort_order": 4},
            {"name": "Sides", "description": "Perfect complements", "sort_order": 5},
        ]

        existing_categories = {c.name: c for c in db.query(Category).all()}
        category_objs = []
        for data in categories:
            if data["name"] not in existing_categories:
                category_objs.append(Category(**data))
        if category_objs:
            db.add_all(category_objs)
            db.flush()
            for cat in category_objs:
                existing_categories[cat.name] = cat

        items_by_category = {
            "Starters": [
                ("Crispy Herb Flatbread", "Golden flatbread finished with herbs and a light garlic glaze.", Decimal("8.50"), ["herb"], 1),
                ("Roasted Tomato Soup", "Velvety tomato soup served with toasted sourdough.", Decimal("7.25"), ["veg"], 2),
                ("Crispy Polenta Bites", "Crispy polenta served with a bright tomato dip.", Decimal("6.75"), ["veg"], 3),
            ],
            "Mains": [
                ("Grilled Chicken Plate", "Grilled chicken breast served with seasonal vegetables and rice.", Decimal("14.99"), ["chicken"], 1),
                ("Wild Mushroom Pasta", "Creamy pasta with roasted mushrooms and parmesan.", Decimal("13.50"), ["mushroom"], 2),
                ("Seared Salmon Bowl", "Seared salmon with rice, greens, and citrus dressing.", Decimal("17.95"), ["fish"], 3),
            ],
            "Desserts": [
                ("Honey Cake Slice", "Soft sponge cake with honey glaze and whipped cream.", Decimal("6.50"), ["sweet"], 1),
                ("Berry Tart", "Buttery tart filled with berry compote.", Decimal("5.95"), ["sweet"], 2),
            ],
            "Drinks": [
                ("House Lemonade", "Fresh citrus lemonade served chilled.", Decimal("3.75"), ["drink"], 1),
                ("Sparkling Mint Tea", "Refreshing mint tea with a sparkling finish.", Decimal("4.25"), ["drink"], 2),
            ],
            "Sides": [
                ("Crispy Fries", "Golden fries with sea salt.", Decimal("4.50"), ["veg"], 1),
                ("Seasonal Greens", "A simple side of roasted seasonal vegetables.", Decimal("4.25"), ["veg"], 2),
            ],
        }

        existing_items = {i.name: i for i in db.query(MenuItem).all()}
        item_objs = []
        for category_name, rows in items_by_category.items():
            category = existing_categories[category_name]
            for name, description, price, allergens, sort_order in rows:
                if name not in existing_items:
                    item_objs.append(
                        MenuItem(
                            category_id=category.id,
                            name=name,
                            description=description,
                            price=price,
                            is_available=True,
                            sort_order=sort_order,
                            allergens=allergens,
                        )
                    )
        if item_objs:
            db.add_all(item_objs)
            db.flush()
            for item in item_objs:
                existing_items[item.name] = item

        ingredient_specs = [
            ("Chicken Breast", "g", 220, 40, True),
            ("Lettuce", "g", 180, 30, True),
            ("Tomato", "g", 150, 35, True),
            ("Cheese", "g", 120, 25, True),
            ("Rice", "g", 400, 80, True),
            ("Butter", "g", 90, 20, True),
            ("Flour", "g", 240, 50, True),
            ("Sugar", "g", 200, 40, True),
        ]

        existing_ingredients = {ing.name: ing for ing in db.query(Ingredient).all()}
        ingredient_objs = []
        for name, unit, qty, threshold, active in ingredient_specs:
            if name not in existing_ingredients:
                ingredient_objs.append(
                    Ingredient(
                        name=name,
                        unit=unit,
                        current_quantity=qty,
                        low_stock_threshold=threshold,
                        is_low_stock=qty <= threshold,
                        is_active=active,
                    )
                )
        if ingredient_objs:
            db.add_all(ingredient_objs)
            db.flush()
            for ing in ingredient_objs:
                existing_ingredients[ing.name] = ing

        recipe_links = [
            ("Grilled Chicken Plate", "Chicken Breast", 180),
            ("Grilled Chicken Plate", "Lettuce", 50),
            ("Grilled Chicken Plate", "Tomato", 70),
            ("Wild Mushroom Pasta", "Flour", 120),
            ("Wild Mushroom Pasta", "Butter", 30),
            ("Honey Cake Slice", "Sugar", 60),
            ("Honey Cake Slice", "Flour", 80),
            ("Crispy Herb Flatbread", "Flour", 90),
            ("Crispy Herb Flatbread", "Butter", 20),
            ("Roasted Tomato Soup", "Tomato", 140),
            ("Seasonal Greens", "Lettuce", 40),
            ("Seasonal Greens", "Tomato", 30),
        ]

        existing_links = {
            (row.menu_item_id, row.ingredient_id)
            for row in db.query(MenuItemIngredient).all()
        }
        for item_name, ingredient_name, qty in recipe_links:
            item = existing_items[item_name]
            ingredient = existing_ingredients[ingredient_name]
            if (item.id, ingredient.id) not in existing_links:
                db.add(MenuItemIngredient(menu_item_id=item.id, ingredient_id=ingredient.id, quantity_used=qty))

        for i in range(1, 7):
            qr_code = f"demo-table-{i}"
            table = db.query(RestaurantTable).filter(RestaurantTable.qr_code == qr_code).first()
            if not table:
                db.add(RestaurantTable(label=f"Table {i}", qr_code=qr_code, is_active=True))

        db.commit()
        print("Seeded demo data.")
        print("  Admin: admin@dinemate.com / admin123")
        print("  Demo tables: Table 1-6")
        print("  Customer URLs: /table/demo-table-1 ... /table/demo-table-6")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
