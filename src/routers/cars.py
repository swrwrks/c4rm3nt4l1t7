from fastapi import APIRouter, HTTPException
from src import schemas
from src.db_connector import db

router = APIRouter(prefix="/cars", tags=["cars"])

@router.get("/", response_model=list[schemas.Car])
def get_all_cars():
    cars = db.execute("SELECT * FROM cars")
    return cars

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