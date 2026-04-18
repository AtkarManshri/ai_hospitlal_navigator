"""
Simple in-memory TTL cache for query results.
Minimizes redundant LLM calls for repeated or similar queries.
"""
import time
from typing import Any, Optional, Dict, Tuple

# Cache storage: key -> (value, timestamp)
_cache: Dict[str, Tuple[Any, float]] = {}

# Default TTL: 1 hour
DEFAULT_TTL = 3600


def cache_get(key: str, ttl: int = DEFAULT_TTL) -> Optional[Any]:
    """Get a value from cache if it exists and hasn't expired."""
    if key in _cache:
        value, timestamp = _cache[key]
        if time.time() - timestamp < ttl:
            return value
        else:
            # Expired — remove it
            del _cache[key]
    return None


def cache_set(key: str, value: Any) -> None:
    """Store a value in the cache with current timestamp."""
    _cache[key] = (value, time.time())


def cache_clear() -> None:
    """Clear the entire cache."""
    _cache.clear()


def make_cache_key(query: str) -> str:
    """Create a normalized cache key from a search query."""
    return query.lower().strip()
