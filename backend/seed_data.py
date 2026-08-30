import random
from datetime import datetime, timedelta
from django.utils import timezone
from energy.models import (
    WeatherData, GenerationData, LoadData, BatteryData,
    Forecast, EnergyDecision, Alert
)

WeatherData.objects.all().delete()
GenerationData.objects.all().delete()
LoadData.objects.all().delete()
BatteryData.objects.all().delete()
Forecast.objects.all().delete()
EnergyDecision.objects.all().delete()
Alert.objects.all().delete()

now = timezone.now()
battery_soc = 60.0

print("Generating 7 days of hourly data...")

for hours_ago in range(7 * 24, 0, -1):
    ts = now - timedelta(hours=hours_ago)
    hour = ts.hour

    if 6 <= hour <= 18:
        solar = max(0, 80 * (1 - abs(hour - 12) / 6)) + random.uniform(-5, 5)
    else:
        solar = 0
    solar = round(max(0, solar), 1)

    wind = round(random.uniform(5, 35), 1)
    cloud_cover = round(random.uniform(10, 90), 1)
    temperature = round(20 + 8 * (1 if 10 <= hour <= 16 else -0.3) + random.uniform(-2, 2), 1)
    load = round(40 + 20 * (1 if 18 <= hour <= 22 else 0.3) + random.uniform(-5, 5), 1)

    WeatherData.objects.create(
        timestamp=ts, temperature=temperature,
        humidity=round(random.uniform(30, 80), 1),
        cloud_cover=cloud_cover,
        wind_speed=round(random.uniform(2, 12), 1),
        irradiance=round(solar * 10, 1),
    )

    GenerationData.objects.create(timestamp=ts, solar_generation=solar, wind_generation=wind)
    LoadData.objects.create(timestamp=ts, consumption=load)

    net = (solar + wind) - load
    battery_soc = min(100, max(10, battery_soc + net * 0.3))
    charge = max(0, net) if net > 0 else 0
    discharge = max(0, -net) if net < 0 else 0

    BatteryData.objects.create(
        timestamp=ts, soc=round(battery_soc, 1),
        charge_power=round(charge, 1), discharge_power=round(discharge, 1),
        health_indicator=round(random.uniform(92, 99), 1),
    )

    Forecast.objects.create(
        timestamp=ts,
        predicted_solar=round(solar + random.uniform(-8, 8), 1),
        predicted_wind=round(wind + random.uniform(-5, 5), 1),
        predicted_load=round(load + random.uniform(-6, 6), 1),
    )

    if hours_ago % 4 == 0:
        if net > 0:
            source, batt_action, grid_action = 'solar+wind', 'charge', 'none'
            reason = 'Renewable generation exceeds load; charging battery.'
        elif battery_soc > 25:
            source, batt_action, grid_action = 'battery', 'discharge', 'none'
            reason = 'Generation below load; discharging battery to cover deficit.'
        else:
            source, batt_action, grid_action = 'grid', 'idle', 'import'
            reason = 'Battery low and generation insufficient; importing from grid.'

        EnergyDecision.objects.create(
            timestamp=ts, source_selection=source,
            battery_action=batt_action, grid_action=grid_action, reason=reason,
        )

    if battery_soc < 20:
        Alert.objects.create(
            timestamp=ts, alert_type='Low Battery', severity='high',
            expected_value=30, actual_value=round(battery_soc, 1), status='active',
        )
    if cloud_cover > 85 and solar < 5 and 8 <= hour <= 16:
        Alert.objects.create(
            timestamp=ts, alert_type='Low Solar Generation', severity='medium',
            expected_value=40, actual_value=solar, status='resolved',
        )

print(f"Done! Created:")
print(f"  WeatherData: {WeatherData.objects.count()}")
print(f"  GenerationData: {GenerationData.objects.count()}")
print(f"  LoadData: {LoadData.objects.count()}")
print(f"  BatteryData: {BatteryData.objects.count()}")
print(f"  Forecast: {Forecast.objects.count()}")
print(f"  EnergyDecision: {EnergyDecision.objects.count()}")
print(f"  Alert: {Alert.objects.count()}")