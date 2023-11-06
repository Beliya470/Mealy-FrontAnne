from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token, create_refresh_token,
    get_jwt_identity, get_jwt_claims, decode_token
)
import json as _json
from flask_migrate import Migrate
from sqlalchemy import ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import date, datetime, timedelta
from flask import redirect, url_for


app = Flask(__name__)
CORS(app)


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///beliya23'
# 'postgresql://beliya470:Jelly360@localhost/beliya470'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-256-bit-secret'
app.config['JWT_SECRET_KEY'] = 'your-256-bit-secret'
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

# ... (other imports and configurations)





@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'])

    existing_admin = Admin.query.filter_by(username=data['username']).first()
    existing_user = User.query.filter_by(username=data['username']).first()

    if existing_admin or existing_user:
        return jsonify({"error": "username_taken", "message": "Username already taken!"}), 409

    existing_email_admin = Admin.query.filter_by(email=data['email']).first()
    existing_email_user = User.query.filter_by(email=data['email']).first()

    if existing_email_admin or existing_email_user:
        return jsonify({"error": "email_taken", "message": "Email already in use!"}), 409

    if data.get('role') == 'admin':
        new_admin = Admin(username=data['username'], password=hashed_password, email=data['email'])
        db.session.add(new_admin)
        db.session.commit()
        return redirect(url_for('login_admin')), 201
    else:
        new_user = User(username=data['username'], password=hashed_password, email=data['email'])
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login_user')), 201

@app.route('/users/me', methods=['GET'])
@jwt_required
def get_user_details():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found!"}), 404

    return jsonify({
        "user_id": user.id,
        "name": user.username,
        "email": user.email,
        "role": "customer"
    }), 200

@app.route('/login_admin', methods=['POST'])
def login_admin():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Incomplete login data!"}), 400

    admin = Admin.query.filter_by(email=data['email']).first()
    if not admin or not check_password_hash(admin.password, data['password']):
        return jsonify({"message": "Invalid credentials!"}), 401

    # Create JWT tokens
    try:
        
        access_token = create_access_token(identity=admin.id, user_claims={"role": "admin", "admin_id": admin.id})

        refresh_token = create_refresh_token(identity=admin.id)
        
        # Make sure tokens are in the correct JWT format
        if '.' not in access_token or '.' not in refresh_token:
            raise ValueError("Token does not have enough segments")
        
        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "isAuthenticated": True,
            "user_id": admin.id,
            "name": admin.username,
            "role": "admin"
        }), 200
    except ValueError as e:
        # Log specific error for debugging
        app.logger.error(f"Error in token generation: {str(e)}")
        return jsonify({"message": "Error generating tokens"}), 500


@app.route('/login_user', methods=['POST'])
def login_user():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Incomplete login data!"}), 400

    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"message": "Invalid credentials!"}), 401

    # Create JWT tokens
    try:
        access_token = create_access_token(identity=user.id, user_claims={"role": "user"})
        refresh_token = create_refresh_token(identity=user.id)
        
        # Make sure tokens are in the correct JWT format
        if '.' not in access_token or '.' not in refresh_token:
            raise ValueError("Token does not have enough segments")
        
        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "isAuthenticated": True,
            "user_id": user.id,
            "name": user.username,
            "role": "customer"
        }), 200
    except ValueError as e:
        # Log specific error for debugging
        app.logger.error(f"Error in token generation for user: {str(e)}")
        return jsonify({"message": "Error generating tokens"}), 500




@app.route('/token/refresh', methods=['POST'])
@jwt_required


def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify({"access_token": access_token}), 200


# @app.route('/meals', methods=['GET'])
# @jwt_required
# def get_meal_options():
#     meal_options = Meal.query.all()
#     meal_options_list = []

#     for meal_option in meal_options:
#         meal_option_dict = {
#             'id': meal_option.id,
#             'name': meal_option.name,
#             'description': meal_option.description,
#             'price': meal_option.price,
#             'image_url': meal_option.image_url,
#             'admin_id': meal_option.admin_id,
#             # Add other meal attributes you want to include in the response
#         }
#         meal_options_list.append(meal_option_dict)

#     return jsonify({"meal_options": meal_options_list})
@app.route('/verify-token', methods=['POST'])
def verify_token():
    encoded_token = request.get_json().get('token', None)
    
    if encoded_token:
        try:
            decoded_token = decode_token(encoded_token)  # replace encoded_token with your actual token
            return jsonify(decoded_token), 200
        except Exception as e:
            return jsonify({"error": "An error occurred while decoding the token:", "message": str(e)}), 400
    else:
        return jsonify({"error": "No token provided"}), 400
    
@app.route('/meals', methods=['GET', 'OPTIONS'])  # Add 'OPTIONS' to the methods
@jwt_required
def get_meals():
    claims = get_jwt_claims()

    if request.method == 'OPTIONS':
        # You can use this space to add any specific headers you want for OPTIONS requests
        response = app.make_default_options_response()
    else:
        # Your GET request handling as before
        meal_options = Meal.query.all()
        meal_options_list = []

        if not meal_options:
            return jsonify({"message": "No meals available"}), 404

        for meal_option in meal_options:
            meal_option_dict = {
                'id': meal_option.id,
                'name': meal_option.name,
                'description': meal_option.description,
                'price': meal_option.price,
                'image_url': meal_option.image_url,
                'admin_id': meal_option.admin_id,
            }
            meal_options_list.append(meal_option_dict)

        response = jsonify({"meal_options": meal_options_list})

    # Include the necessary CORS headers in the response for OPTIONS requests
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    
    return response


# @app.route('/meals', methods=['POST'])
# @jwt_required
# def create_meal_option():
#     current_user = get_jwt_identity()
@app.route('/meals', methods=['POST'])
@jwt_required
def create_meal_option():
    claims = get_jwt_claims()
    current_user_id = get_jwt_identity()
    admin_id = claims['admin_id'] if 'admin_id' in claims else None

    if not admin_id:
        return jsonify({"message": "Admin ID not found in token"}), 404
    # Check if the 'role' key exists and if the user's role is 'admin' to proceed
    # if "role" not in current_user or current_user["role"] != "admin":
    #     return jsonify({"message": "Access denied"}), 403

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

@app.route('/meals/<int:meal_option_id>', methods=['PUT'])
@jwt_required
def update_meal_option(meal_option_id):
    current_user = get_jwt_identity()

    # Check if the 'role' key exists and if the user's role is 'admin' to proceed
    if "role" not in current_user or current_user["role"] != "admin":
        return jsonify({"message": "Access denied"}), 403

    new_meal_option_name = request.json.get('new_meal_option')
    if not new_meal_option_name:
        return jsonify({"message": "New meal option name is required"}), 400

    meal_option = Meal.query.get(meal_option_id)
    if meal_option:
        meal_option.name = new_meal_option_name
        db.session.commit()
        return jsonify({"message": "Meal option updated successfully"})
    else:
        return jsonify({"message": "Meal option not found"}), 404

@app.route('/meals/<int:meal_option_id>', methods=['DELETE'])
@jwt_required
def delete_meal_option(meal_option_id):
    current_user = get_jwt_identity()

    # Check if the 'role' key exists and if the user's role is 'admin' to proceed
    if "role" not in current_user or current_user["role"] != "admin":
        return jsonify({"message": "Access denied"}), 403

    meal_option = Meal.query.get(meal_option_id)
    if meal_option:
        db.session.delete(meal_option)
        db.session.commit()
        return jsonify({"message": "Meal option deleted successfully"})
    else:
        return jsonify({"message": "Meal option not found"}), 404


@app.route('/menu', methods=['GET'])
@jwt_required
def get_todays_menu():
    print("Accessing /menu route")
    # Fetch today's menu
    today = date.today()
    menu = Menu.query.filter_by(day=today).first()

    # If there is no menu for today, return an empty response
    if not menu:
        return jsonify({"message": "No menu available for today"}), 404
    
    # Get the meals associated with today's menu
    menu_meals = MenuMeals.query.filter_by(menu_id=menu.id).all()
    meal_ids = [menu_meal.meal_id for menu_meal in menu_meals]
    meals = Meal.query.filter(Meal.id.in_(meal_ids)).all()

    # Prepare response
    response = {
        "menu": {
            "day": str(menu.day),
            "meals": [{"id": meal.id, "name": meal.name, "price": meal.price, "description": meal.description} for meal in meals]
        }
    }

    return jsonify(response), 200

{
    "token": "YOUR_JWT_TOKEN"
}


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run()
