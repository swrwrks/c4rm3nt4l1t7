from fastapi import APIRouter, HTTPException, Depends
from src.schemas import TokenData
from src.security import get_current_user
from src.db_connector import db

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_profile(current_user: TokenData = Depends(get_current_user)):
    user = db.execute(
        "SELECT id, user_name, email, phone, role, is_active, created_at FROM users WHERE user_name = %s",
        (current_user.user_name,),
        fetch_one=True
    )
    return user