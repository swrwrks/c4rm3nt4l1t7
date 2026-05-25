import os
from flask import Flask, render_template, request, redirect, url_for, flash
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


@app.route('/')
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