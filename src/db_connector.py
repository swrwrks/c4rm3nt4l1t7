import psycopg2
from dotenv import load_dotenv
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
import os

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