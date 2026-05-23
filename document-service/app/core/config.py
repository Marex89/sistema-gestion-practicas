from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str = "dev-secret-key-change-in-production"
    internship_service_url: str = "http://internship-service:8000"
    notification_service_url: str = "http://notification-service:8000"
    storage_path: str = "/app/storage"
    max_file_size_kb: int = 1024
    max_photo_size_kb: int = 256

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
