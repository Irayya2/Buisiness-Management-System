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
    # Set CORS_ORIGINS env var to "*" for open access, or a comma-separated
    # list of allowed origins (e.g. "https://myapp.up.railway.app").
    # Defaults to localhost for local development.
    _cors_env = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000')
    CORS_ORIGINS = '*' if _cors_env.strip() == '*' else [o.strip() for o in _cors_env.split(',')]

    DEBUG = os.getenv('FLASK_DEBUG', 'True') == 'True'
