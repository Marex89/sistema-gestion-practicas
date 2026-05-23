from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str = "dev-secret-key-change-in-production"
    auth_service_url: str = "http://auth-service:8000"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "noreply@practicas.cl"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
