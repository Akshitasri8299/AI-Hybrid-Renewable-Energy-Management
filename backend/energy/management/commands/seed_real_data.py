import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from energy.models import (
    WeatherData, GenerationData, LoadData, BatteryData,
    Forecast, EnergyDecision, Alert
)
from energy.real_weather import fetch_historical_weather


class Command(BaseCommand):
    help = "Seeds the database with REAL weather data from Jaipur, Rajasthan (via Open-Meteo)"

    def handle(self, *args, **options):
        self.stdout.write("Fetching real weather data for Jaipur, Rajasthan...")

        try:
            weather_records = fetch_historical_weather(days_back=7)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to fetch weather data: {e}"))
            return

        if not weather_records:
            self.stdout.write(self.style.ERROR("No weather data returned."))
            return

        self.stdout.write(f"Got {len(weather_records)} real hourly weather records.")

        WeatherData.objects.all().delete()
        GenerationData.objects.all().delete()
        LoadData.objects.all().delete()
        BatteryData.objects.all().delete()
        Forecast.objects.all().delete()
        EnergyDecision.objects.all().delete()
        Alert.objects.all().delete()

        battery_soc = 60.0

        SOLAR_PANEL_CAPACITY_KW = 100
        WIND_TURBINE_CAPACITY_KW = 50

        for record in weather_records:
            ts = timezone.make_aware(datetime.fromisoformat(record['timestamp']))
            hour = ts.hour

            temperature = record['temperature'] or 25
            humidity = record['humidity'] or 50
            cloud_cover = record['cloud_cover'] or 30
            wind_speed = record['wind_speed'] or 5
            irradiance = record['irradiance'] or 0

            solar = round((irradiance / 1000) * SOLAR_PANEL_CAPACITY_KW, 1)
            solar = max(0, solar)

            wind_fraction = min(1.0, (wind_speed / 15) ** 3)
            wind = round(wind_fraction * WIND_TURBINE_CAPACITY_KW, 1)

            load = round(40 + 20 * (1 if 18 <= hour <= 22 else 0.3) + random.uniform(-5, 5), 1)

            WeatherData.objects.create(
                timestamp=ts, temperature=temperature, humidity=humidity,
                cloud_cover=cloud_cover, wind_speed=wind_speed, irradiance=irradiance,
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
                timestamp=ts - timedelta(hours=1),
                target_time=ts,
                predicted_solar=round(solar + random.uniform(-5, 5), 1),
                predicted_wind=round(wind + random.uniform(-3, 3), 1),
                predicted_load=round(load + random.uniform(-4, 4), 1),
            )

            if hour % 4 == 0:
                if net > 0 and solar > 0 and wind > 0:
                    source, batt_action, grid_action = 'mixed', 'charge', 'none'
                    reason = 'Renewable generation exceeds load; charging battery.'
                elif net > 0:
                    source = 'solar' if solar > wind else 'wind'
                    batt_action, grid_action = 'charge', 'none'
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

        self.stdout.write(self.style.SUCCESS("Done! Seeded with REAL Jaipur weather data:"))
        self.stdout.write(f"  WeatherData: {WeatherData.objects.count()}")
        self.stdout.write(f"  GenerationData: {GenerationData.objects.count()}")
        self.stdout.write(f"  LoadData: {LoadData.objects.count()}")
        self.stdout.write(f"  BatteryData: {BatteryData.objects.count()}")
        self.stdout.write(f"  Forecast: {Forecast.objects.count()}")
        self.stdout.write(f"  EnergyDecision: {EnergyDecision.objects.count()}")
        self.stdout.write(f"  Alert: {Alert.objects.count()}")