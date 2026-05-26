from fastapi import APIRouter, HTTPException
from src import schemas
from src.db_connector import db

router = APIRouter(prefix="/cars", tags=["cars"])


@router.get("/")
def get_all_cars():
    try:
        # Получаем все машины
        cars = db.execute("SELECT * FROM cars", fetch_one=False)

        if not cars:
            return []

        result = []
        for car in cars:
            try:
                # Получаем ID машины
                car_id = car['id']

                # Считаем сколько пользователей добавили эту машину в избранное
                count_result = db.execute(
                    "SELECT COUNT(*) as cnt FROM users WHERE %s = ANY(favorites)",
                    params=(car_id,),
                    fetch_one=True
                )

                # Получаем количество (0 если пусто)
                favorites_count = count_result['cnt'] if count_result else 0

                # Создаём словарь с данными машины
                car_dict = {
                    'id': car_id,
                    'model': car['model'],
                    'price': car['price'],
                    'status': car['status'],
                    'year': car['year'],
                    'color': car['color'],
                    'mileage': car['mileage'],
                    'brand_id': car['brand_id'],
                    'created_at': car['created_at'],
                    'favorites_count': favorites_count
                }

                result.append(car_dict)

            except Exception as car_error:
                print(f"Error processing car {car}: {car_error}")
                continue

        return result

    except Exception as e:
        print(f"ERROR in get_all_cars: {e}")
        return []


@router.get("/{car_id}", response_model=schemas.Car)
def get_car(car_id: int):
    car = db.execute(
        "SELECT * FROM cars WHERE id = %s",
        params=(car_id,),
        fetch_one=True
    )
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    return car


@router.post("/", response_model=schemas.Car)
def create_car(car: schemas.CarCreate):
    new_car = db.execute(
        """
        INSERT INTO cars (model, price, status, year, color, mileage, brand_id) 
        VALUES (%s, %s, %s, %s, %s, %s, %s) 
        RETURNING *
        """,
        params=(car.model, car.price, car.status, car.year, car.color, car.mileage, car.brand_id),
        fetch_one=True
    )
    return new_car


@router.put("/{car_id}", response_model=schemas.Car)
def update_car(car_id: int, car: schemas.CarCreate):
    updated = db.execute(
        """
        UPDATE cars 
        SET model = %s, price = %s, status = %s, year = %s, color = %s, mileage = %s, brand_id = %s
        WHERE id = %s
        RETURNING *
        """,
        params=(car.model, car.price, car.status, car.year, car.color, car.mileage, car.brand_id, car_id),
        fetch_one=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Car not found")
    return updated


@router.delete("/{car_id}")
def delete_car(car_id: int):
    deleted_count = db.execute(
        "DELETE FROM cars WHERE id = %s",
        params=(car_id,)
    )
    if deleted_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    return {"message": "Car deleted successfully"}