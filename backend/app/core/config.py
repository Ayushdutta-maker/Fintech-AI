import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend/ or repository root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR.parent / ".env")

class Settings:
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./finance.db")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "finance-tracker-insecure-secret-key-change-in-prod-12345")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:3000")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://xivyidcovjckojhvxxyw.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "sb_publishable_bA21n8WTnjmuBxyqcqT2OQ_2VGzvBYG")

settings = Settings()
