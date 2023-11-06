from app import db, Admin  
from werkzeug.security import generate_password_hash


username = 'admin1'
email = 'admin1@example.com'


admin = Admin.query.filter_by(username=username, email=email).first()

if admin:
   
    new_password = 'zxcvbnm'  
    hashed_password = generate_password_hash(new_password, method='sha256')
    admin.password = hashed_password
    db.session.commit()
    print("Password has been reset successfully.")
else:
    print("Admin not found")
