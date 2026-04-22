from contextlib import asynccontextmanager
from fastapi import FastAPI
from src.routers import cars, brands
from src.db_connector import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    db.close()

app = FastAPI(title="Cars API", lifespan=lifespan)

app.include_router(cars.router)
app.include_router(brands.router)

@app.get("/")
def root():
    return {"message": "Cars API is running"}