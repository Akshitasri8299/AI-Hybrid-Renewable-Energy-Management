"""
Trains simple ML models to predict solar generation, wind generation, and load
from weather data. Uses data already in the database (from seed_data or real data).

Run from the backend folder with:
    python ../ml/train_forecast_model.py
"""
import os
import sys
import django

# Setup Django so we can access the database from this standalone script
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

from energy.models import WeatherData, GenerationData, LoadData

print("Loading data from database...")

weather_qs = WeatherData.objects.all().order_by('timestamp').values(
    'timestamp', 'temperature', 'humidity', 'cloud_cover', 'wind_speed', 'irradiance'
)
generation_qs = GenerationData.objects.all().order_by('timestamp').values(
    'timestamp', 'solar_generation', 'wind_generation'
)
load_qs = LoadData.objects.all().order_by('timestamp').values('timestamp', 'consumption')

weather_df = pd.DataFrame(weather_qs)
generation_df = pd.DataFrame(generation_qs)
load_df = pd.DataFrame(load_qs)

if weather_df.empty or generation_df.empty or load_df.empty:
    print("Not enough data to train. Run 'python manage.py seed_data' first.")
    sys.exit(1)

# Merge everything on timestamp
df = weather_df.merge(generation_df, on='timestamp').merge(load_df, on='timestamp')
df['hour'] = pd.to_datetime(df['timestamp']).dt.hour

print(f"Loaded {len(df)} rows for training.")

# Features used to predict: hour of day + weather conditions
features = ['hour', 'temperature', 'humidity', 'cloud_cover', 'wind_speed', 'irradiance']
X = df[features]

os.makedirs(os.path.join(os.path.dirname(__file__), 'models'), exist_ok=True)

targets = {
    'solar_generation': 'solar_model.pkl',
    'wind_generation': 'wind_model.pkl',
    'consumption': 'load_model.pkl',
}

for target_col, filename in targets.items():
    y = df[target_col]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    print(f"{target_col}: trained. Mean Absolute Error = {mae:.2f}")

    model_path = os.path.join(os.path.dirname(__file__), 'models', filename)
    joblib.dump(model, model_path)
    print(f"  Saved to {model_path}")

print("\nAll models trained and saved successfully!")