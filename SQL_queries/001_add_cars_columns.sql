ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS year INTEGER;

COMMENT ON COLUMN public.cars.year IS 'Год выпуска автомобиля';

ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS color VARCHAR(50);

COMMENT ON COLUMN public.cars.color IS 'Цвет кузова автомобиля';

ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS mileage INTEGER DEFAULT 0;

COMMENT ON COLUMN public.cars.mileage IS 'Пробег автомобиля в километрах'