from app.database.session import SessionLocal
from app.models.user import User
from app.security.auth import get_password_hash
from app.models.dining import Category, MenuItem, RestaurantTable, Ingredient, MenuItemIngredient


def main():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == 'admin@example.com').first()
        if not user:
            user = User(email='admin@example.com', full_name='Admin', hashed_password=get_password_hash('admin123'), role='admin')
            db.add(user)
        db.commit()

        cat = db.query(Category).filter(Category.name == 'Starters').first()
        if not cat:
            cat = Category(name='Starters', description='Sample starters', sort_order=1)
            db.add(cat)
            db.flush()

        item = db.query(MenuItem).filter(MenuItem.name == 'House Salad').first()
        if not item:
            item = MenuItem(category_id=cat.id, name='House Salad', description='Fresh greens', price=12.50, sort_order=1)
            db.add(item)
            db.flush()

        table = db.query(RestaurantTable).filter(RestaurantTable.label == 'Table 12').first()
        if not table:
            table = RestaurantTable(label='Table 12', qr_code='table-12', is_active=True)
            db.add(table)
            db.flush()

        ing = db.query(Ingredient).filter(Ingredient.name == 'Lettuce').first()
        if not ing:
            ing = Ingredient(name='Lettuce', unit='g', current_quantity=100, low_stock_threshold=20, is_low_stock=False)
            db.add(ing)
            db.flush()
            db.add(MenuItemIngredient(menu_item_id=item.id, ingredient_id=ing.id, quantity_used=50))

        db.commit()
        print('seeded')
    finally:
        db.close()


if __name__ == '__main__':
    main()
