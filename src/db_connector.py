import psycopg2
from dotenv import load_dotenv
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import os
from src.security import get_password_hash

load_dotenv()

class Database:
    def __init__(self):
        self.params = {
            'host': os.getenv('DB_HOST'),
            'database': os.getenv('DB_NAME'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'port': int(os.getenv('DB_PORT', 5432))
        }

        self.pool = pool.SimpleConnectionPool(1, 5, **self.params)
        print("Подключение к базе данных установлено")

    def execute(self, query, params=None, fetch_one=False):
        conn = self.pool.getconn()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)

                if 'RETURNING' in query.upper():
                    conn.commit()
                    if fetch_one:
                        return cur.fetchone()
                    return cur.fetchall()

                if query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
                    conn.commit()
                    return cur.rowcount

                if fetch_one:
                    return cur.fetchone()
                return cur.fetchall()
        except Exception as e:
            conn.rollback()
            print("Ошибка выполнения запроса:", e)
            raise e
        finally:
            self.pool.putconn(conn)

    def close(self):
        self.pool.closeall()
        print("Соединения закрыты")

db = Database()

def get_user_by_username(username: str):
    query = "SELECT * FROM users WHERE user_name = %s AND is_active = TRUE"
    return db.execute(query, (username,), fetch_one=True)

def create_user(username: str, password: str, email: str, phone: str = None):
    hashed_password = get_password_hash(password)
    query = """
        INSERT INTO users (user_name, password_hash, email, phone, role, is_active)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id, user_name, email, phone, role, is_active, created_at
    """
    params = (username, hashed_password, email, phone, "customer", True)
    return db.execute(query, params, fetch_one=True)