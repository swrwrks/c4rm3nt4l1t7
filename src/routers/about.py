from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse
import json
import hashlib
from pathlib import Path
from src.db_connector import db
from datetime import datetime

router = APIRouter(tags=["About & Hash"])

ABOUT_FILE = Path(__file__).parent.parent / "about.json"


@router.get("/about", response_class=HTMLResponse)
def get_about_html():
    try:
        with open(ABOUT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading about data: {str(e)}")

    html_content = f"""
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>О проекте - {data.get('project_name', 'Car Dealership')}</title>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 20px;
            }}
            .container {{
                max-width: 900px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                text-align: center;
            }}
            .header h1 {{ font-size: 2.5em; margin-bottom: 10px; }}
            .header p {{ font-size: 1.1em; opacity: 0.9; }}
            .content {{ padding: 40px; }}
            .section {{ margin-bottom: 30px; }}
            .section h2 {{
                color: #667eea;
                font-size: 1.8em;
                margin-bottom: 15px;
                border-bottom: 3px solid #667eea;
                padding-bottom: 10px;
            }}
            .section p {{ color: #555; line-height: 1.8; font-size: 1.05em; }}
            .team-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }}
            .team-card {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }}
            .team-card strong {{ color: #667eea; display: block; margin-bottom: 5px; font-size: 1.1em; }}
            .team-card span {{ color: #666; }}
            .feature-list {{ list-style: none; margin-top: 15px; }}
            .feature-list li {{
                padding: 12px 0;
                padding-left: 35px;
                position: relative;
                color: #555;
                font-size: 1.05em;
            }}
            .feature-list li::before {{
                content: "✓";
                position: absolute;
                left: 0;
                color: #667eea;
                font-weight: bold;
                font-size: 1.2em;
            }}
            .tech-stack {{ display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px; }}
            .tech-badge {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: 500;
            }}
            .version {{
                text-align: center;
                color: #999;
                padding: 20px;
                background: #f8f9fa;
                font-size: 0.9em;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{data.get('project_name', 'Car Dealership')}</h1>
                <p>Информация о проекте</p>
            </div>
            <div class="content">
                <div class="section">
                    <h2>Описание проекта</h2>
                    <p>{data.get('description', 'No description')}</p>
                </div>
                <div class="section">
                    <h2>Команда разработчиков</h2>
                    <div class="team-grid">
                        <div class="team-card">
                            <strong>Backend Developer</strong>
                            <span>{data.get('team', {{}}).get('backend', 'N/A')}</span>
                        </div>
                        <div class="team-card">
                            <strong>Frontend Developer</strong>
                            <span>{data.get('team', {{}}).get('frontend', 'N/A')}</span>
                        </div>
                        <div class="team-card">
                            <strong>Data Engineer</strong>
                            <span>{data.get('team', {{}}).get('data_engineer', 'N/A')}</span>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <h2>Функционал</h2>
                    <ul class="feature-list">
                        {''.join([f'<li>{{feature}}</li>' for feature in data.get('functionality', [])])}
                    </ul>
                </div>
                <div class="section">
                    <h2>Технологии</h2>
                    <div class="tech-stack">
                        {''.join([f'<span class="tech-badge">{{tech}}</span>' for tech in data.get('tech_stack', {{}}).values()])}
                    </div>
                </div>
            </div>
            <div class="version">
                Version {data.get('version', '1.0.0')} | API: <a href="/api/about" style="color: #667eea;">/api/about</a>
            </div>
        </div>
    </body>
    </html>
    """
    return html_content


@router.get("/api/about")
def get_about_json():
    try:
        with open(ABOUT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="About file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Invalid JSON format")


@router.get("/api/hash/{text}")
def hash_string(text: str):
    hash_result = hashlib.sha256(text.encode('utf-8')).hexdigest()
    return {
        "request": text,
        "result": hash_result
    }

@router.get("/api/support")
def support_data():
    cars = db.execute("SELECT COUNT(*) as count FROM cars", fetch_one=True)['count']
    brands = db.execute("SELECT COUNT(*) as count FROM brands", fetch_one=True)['count']
    users = db.execute("SELECT COUNT(*) as count FROM users", fetch_one=True)['count']

    return {
        "service": "Supporting",
        "analytics": {"cars": cars, "brands": brands, "users": users},
        "auth": {"status": "active", "type": "JWT"},
        "notifications": [{"msg": "API Gateway connected"}]
    }