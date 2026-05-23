from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"

    auth_service_url: str = "http://auth-service:8000"
    academic_service_url: str = "http://academic-service:8000"
    internship_service_url: str = "http://internship-service:8000"
    evaluation_service_url: str = "http://evaluation-service:8000"
    document_service_url: str = "http://document-service:8000"
    notification_service_url: str = "http://notification-service:8000"


settings = Settings()
