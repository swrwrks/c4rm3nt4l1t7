import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'dev_secret')

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'database': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'port': int(os.getenv('DB_PORT', 5432))
}


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)


class AdminUser(UserMixin):
    def __init__(self, username):
        self.id = username
        self.username = username


login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


@login_manager.user_loader
def load_user(user_id):
    if user_id == os.getenv('ADMIN_USERNAME'):
        return AdminUser(user_id)
    return None


def verify_admin_password(password):
    admin_pass = os.getenv('ADMIN_PASSWORD')
    return password == admin_pass


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if username == os.getenv('ADMIN_USERNAME') and verify_admin_password(password):
            user = AdminUser(username)
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Неверный логин или пароль')
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route('/')
@login_required
def dashboard():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT c.id, c.model, c.price, c.status, c.year, c.color, c.mileage, c.brand_id, b.name as brand_name
        FROM cars c
        LEFT JOIN brands b ON c.brand_id = b.id
        ORDER BY c.created_at DESC
    """)
    cars = cur.fetchall()

    cur.execute("SELECT id, name FROM brands ORDER BY name")
    brands = cur.fetchall()

    cur.close()
    conn.close()

    return render_template('dashboard.html', cars=cars, brands=brands)


@app.route('/car/add', methods=['POST'])
@login_required
def add_car():
    model = request.form.get('model')
    price = float(request.form.get('price'))
    year = int(request.form.get('year'))
    color = request.form.get('color')
    mileage = int(request.form.get('mileage'))
    brand_id = request.form.get('brand_id') or None
    status = request.form.get('status') or 'available'

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO cars (model, price, year, color, mileage, brand_id, status)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (model, price, year, color, mileage, brand_id, status))
    conn.commit()
    cur.close()
    conn.close()

    flash('Машина добавлена')
    return redirect(url_for('dashboard'))


@app.route('/car/<int:car_id>/edit', methods=['POST'])
@login_required
def edit_car(car_id):
    model = request.form.get('model')
    price = float(request.form.get('price'))
    year = int(request.form.get('year'))
    color = request.form.get('color')
    mileage = int(request.form.get('mileage'))
    brand_id = request.form.get('brand_id') or None
    status = request.form.get('status') or 'available'

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE cars 
        SET model=%s, price=%s, year=%s, color=%s, mileage=%s, brand_id=%s, status=%s
        WHERE id=%s
    """, (model, price, year, color, mileage, brand_id, status, car_id))
    conn.commit()
    cur.close()
    conn.close()

    flash('Машина обновлена')
    return redirect(url_for('dashboard'))


@app.route('/car/<int:car_id>/delete', methods=['POST'])
@login_required
def delete_car(car_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM cars WHERE id = %s", (car_id,))
    conn.commit()
    cur.close()
    conn.close()

    flash('Машина удалена')
    return redirect(url_for('dashboard'))


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)