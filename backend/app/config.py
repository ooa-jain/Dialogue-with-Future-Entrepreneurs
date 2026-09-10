from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db: str = "dialogue_futures"

    admin_username: str = "admin"
    admin_password: str = "change-this-password"
    admin_password_hash: str = ""

    jwt_secret: str = "dev-secret-change-me"
    jwt_expire_minutes: int = 480

    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    public_base_url: str = "http://localhost:5173"

    use_mock_db: int = 0
    seed_mock: int = 0

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
