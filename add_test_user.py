from backend.database import SessionLocal
from backend.models import User
from backend.auth import get_password_hash

def add_test_user():
    db = SessionLocal()
    email = "test@test.com"
    if not db.query(User).filter(User.email == email).first():
        user = User(
            email=email,
            hashed_password=get_password_hash("12345"),
            role="admin"
        )
        db.add(user)
        db.commit()
        print(f"User {email} added successfully.")
    else:
        print(f"User {email} already exists.")
    db.close()

if __name__ == "__main__":
    add_test_user()
