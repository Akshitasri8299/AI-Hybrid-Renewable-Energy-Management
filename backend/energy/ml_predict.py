import os
import joblib

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'ml_models')

_solar_model = None
_wind_model = None
_load_model = None


def _load_models():
    global _solar_model, _wind_model, _load_model
    if _solar_model is None:
        _solar_model = joblib.load(os.path.join(MODELS_DIR, 'solar_model.pkl'))
    if _wind_model is None:
        _wind_model = joblib.load(os.path.join(MODELS_DIR, 'wind_model.pkl'))
    if _load_model is None:
        _load_model = joblib.load(os.path.join(MODELS_DIR, 'load_model.pkl'))


def predict(hour, temperature, humidity, cloud_cover, wind_speed, irradiance):
    """
    Predict solar generation, wind generation, and load for a given hour
    and weather conditions, using the trained RandomForest models.
    Returns a dict with predicted_solar, predicted_wind, predicted_load.
    """
    _load_models()

    features = [[hour, temperature, humidity, cloud_cover, wind_speed, irradiance]]

    predicted_solar = float(_solar_model.predict(features)[0])
    predicted_wind = float(_wind_model.predict(features)[0])
    predicted_load = float(_load_model.predict(features)[0])

    return {
        'predicted_solar': round(max(0, predicted_solar), 1),
        'predicted_wind': round(max(0, predicted_wind), 1),
        'predicted_load': round(max(0, predicted_load), 1),
    }