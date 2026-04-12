ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE;

COMMENT ON TABLE public.users IS 'Пользователи системы (клиенты, менеджеры, админы)';
COMMENT ON COLUMN public.users.user_name IS 'Уникальное имя пользователя';
COMMENT ON COLUMN public.users.password_hash IS 'Хеш пароля (bcrypt)';
COMMENT ON COLUMN public.users.email IS 'Email пользователя (уникальный)';
COMMENT ON COLUMN public.users.phone IS 'Номер телефона';
COMMENT ON COLUMN public.users.role IS 'Роль: client, manager, admin';
COMMENT ON COLUMN public.users.is_active IS 'Активен ли пользователь';

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(user_name);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


