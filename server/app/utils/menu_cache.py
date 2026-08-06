MENU_CACHE_KEY = "menu:public"


def invalidate_menu_cache():
    from app.utils.cache import get_redis

    get_redis().delete(MENU_CACHE_KEY)
