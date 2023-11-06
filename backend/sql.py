from app import db, User

# Assuming user_id is the ID of the user whose password you want to retrieve
user_id = 1

# Fetch the user record from the database
user = User.query.filter_by(id=user_id).first()

if user:
    # If the user is found, print the password (or its hash)
    print("Password (or its hash):", user.password)
else:
    print("User not found")
