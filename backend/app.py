from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token, create_refresh_token,
    get_jwt_identity, get_jwt
)
import json as _json
from flask_migrate import Migrate
from sqlalchemy import ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date, datetime, timedelta


app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///beliya23'
# 'postgresql://beliya470:Jelly360@localhost/beliya470'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'super_secret_key'
app.config['JWT_SECRET_KEY'] = 'jwt_secret_key'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Set access token to expire in 1 hour
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)  # Set refresh token to expire in 30 days

db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    role = db.Column(db.String(50), default='customer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    admin = db.relationship('Admin', backref='user', uselist=False)
    orders = db.relationship('Order', backref='user')

class Meal(db.Model):
    __tablename__ = "meal"
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, ForeignKey('admin.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    orders = db.relationship('Order', backref='meal')

class Admin(db.Model):
    __tablename__ = "admin"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, ForeignKey('user.id'))
    username = db.Column(db.String(80), unique=False, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    meals = db.relationship('Meal', backref='admin')

class Menu(db.Model):
    __tablename__ = "menu"
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    day = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    menu_meals = db.relationship('MenuMeals', backref='menu')

class MenuMeals(db.Model):
    __tablename__ = "menu_meals"
    menu_id = db.Column(db.Integer, ForeignKey('menu.id'), primary_key=True)
    meal_id = db.Column(db.Integer, ForeignKey('meal.id'), primary_key=True)

class Order(db.Model):
    __tablename__ = "order"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, ForeignKey('user.id'), nullable=False)
    meal_id = db.Column(db.Integer, ForeignKey('meal.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)


@app.route('/')
def index():
    return "Welcome to my Flask application!"

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'])

    if data.get('role') == 'admin':
        existing_admin = Admin.query.filter_by(username=data['username']).first()
        if existing_admin:
            return jsonify({"error": "username_taken", "message": "Username already taken!"}), 409
        new_admin = Admin(username=data['username'], password=hashed_password, email=data['email'])
        db.session.add(new_admin)
    else:
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({"error": "username_taken", "message": "Username already taken!"}), 409
        new_user = User(username=data['username'], password=hashed_password, email=data['email'])
        db.session.add(new_user)

    db.session.commit()
    return jsonify({"message": f"Registered successfully as a {data['role']}!"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Incomplete login data!"}), 400

    user = None
    if data.get('role') == 'admin':
        user = Admin.query.filter_by(email=data['email']).first()
    else:
        user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials!"}), 401

    access_token = create_access_token(identity=user.id, additional_claims={"role": data['role']})
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "isAuthenticated": True,
        "user_id": user.id,
        "name": user.username,
        "role": data['role']
    }), 200


@app.route('/token/refresh', methods=['POST'])
@jwt_required

def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify({"access_token": access_token}), 200


@app.route('/meals', methods=['GET', 'POST', 'PUT', 'DELETE'])
@jwt_required()
def manage_meal_options():
    current_user = get_jwt()

    # Check if the 'role' key exists and if the user's role is 'admin' to proceed
    if "role" not in current_user or current_user["role"] != "admin":
        return jsonify({"message": "Access denied"}), 403

    if request.method == 'GET':
        meal_options = Meal.query.all()
        meal_options_list = []

        for meal_option in meal_options:
            meal_option_dict = {
                'id': meal_option.id,
                'name': meal_option.name,
                'description': meal_option.description,
                'price': meal_option.price,
                'image_url': meal_option.image_url,
                'admin_id': meal_option.admin_id,
                # Add other meal attributes you want to include in the response
            }
            meal_options_list.append(meal_option_dict)

        return jsonify({"meal_options": meal_options_list})

    elif request.method == 'POST':
        meal_data = request.json
        meal_name = meal_data.get('name')
        meal_description = meal_data.get('description')
        meal_price = meal_data.get('price')
        meal_image_url = meal_data.get('image_url')
        admin_id = meal_data.get('admin_id')

        if not meal_name or not meal_description or not meal_price or not meal_image_url or not admin_id:
            return jsonify({"message": "Missing required fields"}), 400

        new_meal = Meal(
            name=meal_name,
            description=meal_description,
            price=meal_price,
            image_url=meal_image_url,
            admin_id=admin_id
        )

        db.session.add(new_meal)
        db.session.commit()
        return jsonify({"message": "Meal added successfully"})
    
    elif request.method == 'PUT':
        meal_option_id = request.json.get('meal_option_id')
        new_meal_option_name = request.json.get('new_meal_option')
        if not meal_option_id or not new_meal_option_name:
            return jsonify({"message": "Meal option ID and new name are required"}), 400

        meal_option = Meal.query.get(meal_option_id)
        if meal_option:
            meal_option.name = new_meal_option_name
            db.session.commit()
            return jsonify({"message": "Meal option updated successfully"})
        else:
            return jsonify({"message": "Meal option not found"}), 404

    elif request.method == 'DELETE':
        meal_option_id = request.json.get('meal_option_id')
        if not meal_option_id:
            return jsonify({"message": "Meal option ID is required"}), 400

        meal_option = Meal.query.get(meal_option_id)
        if meal_option:
            db.session.delete(meal_option)
            db.session.commit()
            return jsonify({"message": "Meal option deleted successfully"})
        else:
            return jsonify({"message": "Meal option not found"}), 404

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run()
