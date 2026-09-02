"""
Fetches real weather data (historical + forecast) from Open-Meteo's
free API for a real location (default: Jaipur, Rajasthan).
No API key required.
"""
import requests
from datetime import datetime, timedelta

# Jaipur, Rajasthan coordinates
DEFAULT_LAT = 26.9124
DEFAULT_LON = 75.7873

HISTORICAL_URL = "https://archive-api.open-meteo.com/v1/archive"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

HOURLY_FIELDS = "temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,shortwave_radiation"


def fetch_historical_weather(days_back=7, lat=DEFAULT_LAT, lon=DEFAULT_LON):
    """
    Fetches real hourly weather for the last `days_back` days at the
    given location. Returns a list of dicts with:
    timestamp, temperature, humidity, cloud_cover, wind_speed, irradiance
    """
    end_date = datetime.utcnow().date() - timedelta(days=1)  # archive API needs a completed day
    start_date = end_date - timedelta(days=days_back - 1)

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "hourly": HOURLY_FIELDS,
        "timezone": "UTC",
    }

    response = requests.get(HISTORICAL_URL, params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    return _parse_hourly_response(data)


def fetch_forecast_weather(days_ahead=2, lat=DEFAULT_LAT, lon=DEFAULT_LON):
    """
    Fetches real hourly weather forecast for the next `days_ahead` days
    at the given location. Same return shape as fetch_historical_weather.
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": HOURLY_FIELDS,
        "forecast_days": days_ahead,
        "timezone": "UTC",
    }

    response = requests.get(FORECAST_URL, params=params, timeout=30)
    response.raise_for_status()
    data = response.json()

    return _parse_hourly_response(data)


def _parse_hourly_response(data):
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])
    temps = hourly.get("temperature_2m", [])
    humidity = hourly.get("relative_humidity_2m", [])
    cloud = hourly.get("cloud_cover", [])
    wind = hourly.get("wind_speed_10m", [])
    radiation = hourly.get("shortwave_radiation", [])

    records = []
    for i in range(len(times)):
        records.append({
            "timestamp": times[i],
            "temperature": temps[i] if i < len(temps) else None,
            "humidity": humidity[i] if i < len(humidity) else None,
            "cloud_cover": cloud[i] if i < len(cloud) else None,
            "wind_speed": wind[i] if i < len(wind) else None,
            "irradiance": radiation[i] if i < len(radiation) else None,
        })
    return records