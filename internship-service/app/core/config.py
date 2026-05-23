from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql://postgres:postgres@localhost:5432/internship_db"
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"

    auth_service_url: str = "http://auth-service:8000"
    academic_service_url: str = "http://academic-service:8000"
    notification_service_url: str = "http://notification-service:8000"


settings = Settings()
