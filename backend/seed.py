from app import db, User, Admin, Meal, Menu, MenuMeals, Order
from datetime import date, datetime, timedelta
from werkzeug.security import generate_password_hash

def seed_data():
    # Create 5 admins
    for i in range(1, 6):
        user = User(username=f'admin{i}', password=generate_password_hash(f'password{i}'), email=f'admin{i}@example.com', role='admin')
        admin = Admin(user=user, username=f'admin{i}', password=generate_password_hash(f'password{i}'), email=f'admin{i}@example.com')
        db.session.add(admin)

    # Create 5 users
    for i in range(1, 6):
        user = User(username=f'user{i}', password=generate_password_hash(f'password{i}'), email=f'user{i}@example.com')
        db.session.add(user)

    # Create 5 meals for each admin
    for i in range(1, 6):
        for j in range(1, 6):
            meal = Meal(admin_id=i, name=f'Meal{j} by Admin{i}', description=f'Description for Meal{j} by Admin{i}', price=10.99 * j)
            db.session.add(meal)

    # Create 5 menus for each admin
    for i in range(1, 6):
        for j in range(1, 6):
            menu = Menu(admin_id=i, day=date.today() + timedelta(days=j))
            db.session.add(menu)

    db.session.commit()

    # Associate 5 meals with each menu
    for i in range(1, 6):
        for j in range(1, 6):
            menu = Menu.query.filter_by(admin_id=i, day=date.today() + timedelta(days=j)).first()
            for k in range(1, 6):
                menu_meal = MenuMeals(menu_id=menu.id, meal_id=(i-1)*5 + k)
                db.session.add(menu_meal)

    # Create 5 orders for each user
    for i in range(1, 6):
        for j in range(1, 6):
            order = Order(user_id=i, meal_id=j, quantity=j, total_amount=10.99 * j)
            db.session.add(order)

    # Commit the changes
    db.session.commit()
    print('Database seeded!')

if __name__ == '__main__':
    seed_data()
