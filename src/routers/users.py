from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import HTMLResponse
from src.schemas import TokenData, PasswordUpdate
from src.security import get_current_user, verify_password, get_password_hash
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

@router.put("/password")
async def change_password(data: PasswordUpdate, current_user=Depends(get_current_user)):
    user = db.execute(
        "SELECT password_hash FROM users WHERE user_name = %s",
        (current_user.username,),
        fetch_one=True
    )
    if not user or not verify_password(data.old_password, user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid password")

    new_hash = get_password_hash(data.new_password)
    db.execute(
        "UPDATE users SET password_hash = %s WHERE user_name = %s",
        (new_hash, current_user.username)
    )
    return {"message": "Password updated"}

@router.get("/favorites/popular")
def get_popular_cars(limit: int = 10):
    rows = db.execute("""
        SELECT car_id, COUNT(*) as cnt
        FROM users, UNNEST(favorites) as car_id
        GROUP BY car_id
        ORDER BY cnt DESC
        LIMIT %s
    """, (limit,), fetch_one=False)

    popular_ids = [r['car_id'] for r in rows]
    if not popular_ids:
        return []

    return db.execute(f"""
        SELECT * FROM cars WHERE id IN ({','.join(['%s'] * len(popular_ids))})
    """, tuple(popular_ids))


@router.get("/favorites/my")
def get_my_favorites(current_user=Depends(get_current_user)):
    user = db.execute(
        "SELECT favorites FROM users WHERE user_name = %s",
        (current_user.username,),
        fetch_one=True
    )
    if not user or not user['favorites']:
        return []

    return db.execute("""
        SELECT * FROM cars WHERE id = ANY(%s)
    """, (user['favorites'],))


@router.post("/favorites/toggle/{car_id}")
def toggle_favorite(car_id: int, current_user=Depends(get_current_user)):
    car = db.execute("SELECT id FROM cars WHERE id = %s", (car_id,), fetch_one=True)
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")

    user = db.execute(
        "SELECT id, favorites FROM users WHERE user_name = %s",
        (current_user.username,),
        fetch_one=True
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    favorites = user['favorites'] or []
    if car_id in favorites:
        favorites.remove(car_id)
    else:
        favorites.append(car_id)

    db.execute(
        "UPDATE users SET favorites = %s WHERE id = %s",
        (favorites, user['id'])
    )
    return {"favorites": favorites}

@router.get("/{username}", response_class=HTMLResponse)
def profile(username: str, current_user=Depends(get_current_user)):
    if current_user.username != username:
        raise HTTPException(status_code=403, detail="Not allowed")

    user = db.execute("SELECT id, user_name, email, created_at FROM users WHERE user_name = %s", (username,),
                      fetch_one=True)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return f"""<!DOCTYPE html><html><head><title>{username}</title></head>
    <body><h1>{username}</h1>
    <p>ID: {user[0]}</p><p>Email: {user[2]}</p><p>Создан: {user[3]}</p>
    <button onclick="refresh()">Обновить токен</button>
    <div id="token"></div>
    <script>async function refresh(){{const r=await fetch('/auth/refresh',{{method:'POST',headers:{{'Authorization':'Bearer '+localStorage.getItem('token')}}}});const d=await r.json();if(d.access_token){{localStorage.setItem('token',d.access_token);document.getElementById('token').innerText='Новый: '+d.access_token}}}}</script>
    </body></html>"""