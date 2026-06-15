from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8")

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./postermind.db"

    # Redis (optional)
    REDIS_URL: str = ""

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # Google Gemini (free: https://aistudio.google.com/apikey)
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEY_2: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # Image generation backend
    IMAGE_GEN_BACKEND: str = "gemini-art"  # gemini-art | placeholder

    # Storage
    STORAGE_BACKEND: str = "local"


settings = Settings()
