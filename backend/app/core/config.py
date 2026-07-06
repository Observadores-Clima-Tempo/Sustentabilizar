from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    DATABASE_URL: str
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 10

    # CORS — origens permitidas, separadas por vírgula
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Admin bootstrap — criado automaticamente no startup se nenhum admin existir
    ADMIN_EMAIL: str = "admin@sustentabilizar.com"
    ADMIN_PASSWORD: str = "sustentabilizaruenf@dmin123"


settings = Settings()
