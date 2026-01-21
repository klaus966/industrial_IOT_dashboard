from backend.database import SessionLocal
from backend import models
from backend import auth

def create_test_user():
    db = SessionLocal()
    try:
        email = "test@test.com"
        password = "12345"
        
        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if existing_user:
            print(f"User {email} already exists.")
            return

        # Create user
        hashed_password = auth.get_password_hash(password)
        user = models.User(email=email, hashed_password=hashed_password, role="admin")
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"User created successfully: {user.email}")
        
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
