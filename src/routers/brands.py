from fastapi import APIRouter, HTTPException
from src import schemas
from src.db_connector import db

router = APIRouter(prefix="/brands", tags=["brands"])

@router.get("/", response_model=list[schemas.Brand])
def get_all_brands():
    brands = db.execute("SELECT * FROM brands")
    return brands

@router.get("/{brand_id}", response_model=schemas.Brand)
def get_brand(brand_id: int):
    brand = db.execute(
        "SELECT * FROM brands WHERE id = %s",
        params=(brand_id,),
        fetch_one=True
    )
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@router.post("/", response_model=schemas.Brand)
def create_brand(brand: schemas.BrandCreate):
    new_brand = db.execute(
        """
        INSERT INTO brands (name, country, description) 
        VALUES (%s, %s, %s) 
        RETURNING *
        """,
        params=(brand.name, brand.country, brand.description),
        fetch_one=True
    )
    return new_brand