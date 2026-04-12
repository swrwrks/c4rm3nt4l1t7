CREATE TABLE public.brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    country VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE public.brands IS 'Справочник марок автомобилей';
COMMENT ON COLUMN public.brands.id IS 'Уникальный идентификатор марки';
COMMENT ON COLUMN public.brands.name IS 'Название марки (уникальное)';
COMMENT ON COLUMN public.brands.country IS 'Страна производителя';
COMMENT ON COLUMN public.brands.description IS 'Описание марки';


CREATE INDEX idx_brands_name ON public.brands(name);

INSERT INTO public.brands (name, country, description) VALUES
('Toyota', 'Japan', 'Japanese automotive manufacturer'),
('BMW', 'Germany', 'German luxury vehicle manufacturer'),
('Mercedes-Benz', 'Germany', 'German luxury automotive brand'),
('Audi', 'Germany', 'German luxury automotive manufacturer'),
('Ford', 'USA', 'American automobile manufacturer'),
('Honda', 'Japan', 'Japanese multinational conglomerate'),
('Nissan', 'Japan', 'Japanese automobile manufacturer'),
('Volkswagen', 'Germany', 'German motor vehicle manufacturer'),
('Hyundai', 'South Korea', 'South Korean automotive manufacturer'),
('Kia', 'South Korea', 'South Korean automotive manufacturer')
ON CONFLICT (name) DO NOTHING;