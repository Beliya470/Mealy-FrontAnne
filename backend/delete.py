# delete.py

from app import db, User, Admin, Meal, Menu, MenuMeals, Order

def delete_data():
    # Delete all records from the tables
    Order.query.delete()
    MenuMeals.query.delete()
    Menu.query.delete()
    Meal.query.delete()
    Admin.query.delete()
    User.query.delete()

    # Commit the changes
    db.session.commit()

    print("All data has been deleted.")

if __name__ == '__main__':
    delete_data()
