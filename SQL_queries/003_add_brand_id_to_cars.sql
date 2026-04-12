ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS brand_id INTEGER;

UPDATE public.cars c
SET brand_id = b.id
FROM public.brands b
WHERE UPPER(c.brand) = UPPER(b.name);

INSERT INTO public.brands (name, country)
SELECT DISTINCT c.brand, 'Unknown'
FROM public.cars c
WHERE c.brand IS NOT NULL 
AND c.brand NOT IN (SELECT name FROM public.brands)
ON CONFLICT (name) DO NOTHING;

UPDATE public.cars c
SET brand_id = b.id
FROM public.brands b
WHERE UPPER(c.brand) = UPPER(b.name);

ALTER TABLE public.cars 
ADD CONSTRAINT fk_cars_brands 
FOREIGN KEY (brand_id) 
REFERENCES public.brands(id)
ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cars_brand_id ON public.cars(brand_id);
