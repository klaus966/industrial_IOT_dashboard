from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import database, models, schemas, auth

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    """
    Standard OAuth2 compatible token login endpoint.
    Retrieves user by username (email), verifies hash, and returns JWT.
    """
    # 1. Fetch user from DB
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # 2. Verify existence and password hash
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. Create Access Token (JWT)
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    # 4. Return token
    return {"access_token": access_token, "token_type": "bearer"}


