from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "postgresql://postgres:postgres@localhost:5432/academic_db"
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"


settings = Settings()
