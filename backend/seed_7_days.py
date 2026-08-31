import random
import math
from datetime import timedelta
from django.utils import timezone
from energy.models import (
    WeatherData, GenerationData, LoadData, BatteryData,
    Forecast, EnergyDecision
)

# --- Clean up old test data first (optional but keeps things tidy) ---
WeatherData.objects.all().delete()
GenerationData.objects.all().delete()
LoadData.objects.all().delete()
BatteryData.objects.all().delete()
Forecast.objects.all().delete()
EnergyDecision.objects.all().delete()

now = timezone.now().replace(minute=0, second=0, microsecond=0)
start = now - timedelta(days=7)

soc = 60.0  # starting battery state of charge

hours = 7 * 24
for i in range(hours):
    ts = start + timedelta(hours=i)
    hour = ts.hour

    # --- Weather (simple daily cycle + randomness) ---
    temperature = 22 + 8 * math.sin((hour - 6) / 24 * 2 * math.pi) + random.uniform(-2, 2)
    cloud_cover = max(0, min(100, 30 + random.uniform(-20, 30)))
    humidity = max(20, min(90, 50 + random.uniform(-15, 15)))
    wind_speed = max(0, 5 + random.uniform(-3, 4))
    irradiance = max(0, 700 * math.sin(max(0, (hour - 6) / 12 * math.pi)) if 6 <= hour <= 18 else 0)

    WeatherData.objects.create(
        timestamp=ts,
        temperature=round(temperature, 1),
        humidity=round(humidity, 1),
        cloud_cover=round(cloud_cover, 1),
        wind_speed=round(wind_speed, 1),
        irradiance=round(irradiance, 1),
    )

    # --- Generation (solar follows daylight, wind semi-random) ---
    if 6 <= hour <= 18:
        solar = max(0, 70 * math.sin((hour - 6) / 12 * math.pi) * (1 - cloud_cover / 150))
    else:
        solar = 0
    wind = max(0, 15 + wind_speed * 2 + random.uniform(-5, 5))

    GenerationData.objects.create(
        timestamp=ts,
        solar_generation=round(solar, 1),
        wind_generation=round(wind, 1),
    )

    # --- Load (higher morning/evening, lower at night) ---
    base_load = 40 + 15 * math.sin((hour - 8) / 24 * 2 * math.pi) + random.uniform(-5, 5)
    load = max(10, base_load)

    LoadData.objects.create(
        timestamp=ts,
        consumption=round(load, 1),
    )

    # --- Battery (charges on surplus, discharges on deficit) ---
    net = solar + wind - load
    if net > 0:
        charge_power = min(net, 10)
        discharge_power = 0
        soc = min(100, soc + charge_power * 0.5)
    else:
        discharge_power = min(abs(net), 10)
        charge_power = 0
        soc = max(0, soc - discharge_power * 0.5)

    BatteryData.objects.create(
        timestamp=ts,
        soc=round(soc, 1),
        charge_power=round(charge_power, 1),
        discharge_power=round(discharge_power, 1),
        health_indicator=round(96 + random.uniform(-1, 1), 1),
    )

    # --- Forecast (naive: predicted = actual + small noise, for demo purposes) ---
    Forecast.objects.create(
        timestamp=ts,
        target_time=ts,
        predicted_solar=round(solar + random.uniform(-4, 4), 1),
        predicted_wind=round(wind + random.uniform(-3, 3), 1),
        predicted_load=round(load + random.uniform(-3, 3), 1),
    )

    # --- Energy decision (simple rule matching net balance) ---
    if net > 5:
        source, batt_action, grid_action = 'mixed', 'charge', 'none'
        reason = f"Renewable generation ({solar + wind:.1f} kW) exceeds load ({load:.1f} kW). Surplus charging battery."
    elif net < -5:
        source, batt_action, grid_action = 'battery', 'discharge', 'import'
        reason = f"Load ({load:.1f} kW) exceeds renewable generation ({solar + wind:.1f} kW). Battery discharging, grid import active."
    else:
        source, batt_action, grid_action = 'mixed', 'idle', 'none'
        reason = f"Generation ({solar + wind:.1f} kW) closely matches load ({load:.1f} kW). System balanced."

    EnergyDecision.objects.create(
        timestamp=ts,
        source_selection=source,
        battery_action=batt_action,
        grid_action=grid_action,
        reason=reason,
    )

print(f"Created {hours} hours of sample data across all models (7 days).")