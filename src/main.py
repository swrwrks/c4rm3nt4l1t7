from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routers import cars, brands, auth
from src.db_connector import db

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    db.close()

app = FastAPI(title="Cars API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cars.router)
app.include_router(brands.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Cars API is running"}