CREATE OR REPLACE FUNCTION register_user(
    p_user_name VARCHAR,
    p_email VARCHAR,
    p_password_hash VARCHAR,
    p_phone VARCHAR DEFAULT NULL
) RETURNS TABLE (user_id INTEGER, created_at TIMESTAMP) AS $$
BEGIN
    INSERT INTO users (user_name, email, password_hash, phone, role, is_active)
    VALUES (p_user_name, p_email, p_password_hash, p_phone, 'client', true)
    RETURNING id, created_at INTO user_id, created_at;

    RETURN NEXT;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Пользователь с таким user_name или email уже существует';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verify_login(
    p_email VARCHAR,
    p_password_hash VARCHAR
) RETURNS TABLE (
    id INTEGER,
    user_name VARCHAR,
    email VARCHAR,
    role VARCHAR,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.user_name, u.email, u.role, u.is_active
    FROM users u
    WHERE u.email = p_email AND u.password_hash = p_password_hash;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Неверный email или пароль';
    END IF;
END;
$$ LANGUAGE plpgsql;