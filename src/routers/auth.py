from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta
from src.schemas import Token, UserRegister, TokenData
from src import db_connector, security

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    existing_user = db_connector.get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    new_user = db_connector.create_user(
        username=user_data.username,
        password=user_data.password,
        email=user_data.email,
        phone=user_data.phone
    )
    return {"message": "User created", "user_id": new_user["id"]}


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = db_connector.get_user_by_username(form_data.username)

    if not user or not security.verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = security.create_access_token(
        data={"sub": user["user_name"], "user_id": user["id"]},
        expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}