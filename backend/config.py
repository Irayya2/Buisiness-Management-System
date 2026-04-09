import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Database
    DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(__file__), 'app.db'))

    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'change-me-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 86400))
    )

    # CORS
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:5173,http://localhost:3000'
    ).split(',')

    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
