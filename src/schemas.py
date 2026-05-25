from pydantic import BaseModel, ConfigDict
from pydantic_settings import BaseSettings
from typing import Optional
from datetime import datetime


class BrandBase(BaseModel):
    name: str
    country: str
    description: Optional[str] = None


class BrandCreate(BrandBase):
    pass


class Brand(BrandBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CarBase(BaseModel):
    model: str
    price: float
    status: str
    year: int
    color: str
    mileage: int
    brand_id: int


class CarCreate(CarBase):
    pass


class Car(CarBase):
    id: int
    created_at: datetime


class UserRegister(BaseModel):
    username: str
    password: str
    email: str
    phone: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None


class Settings(BaseSettings):
    DB_HOST: str
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str
    DB_PORT: int
    SECRET_KEY: str
    APP_NAME: str = "Honda/Subaru Dealership"

    class Config:
        env_file = ".env"

settings = Settings()