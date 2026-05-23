from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    internship_service_url: str = "http://internship-service:8000"
    notification_service_url: str = "http://notification-service:8000"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
