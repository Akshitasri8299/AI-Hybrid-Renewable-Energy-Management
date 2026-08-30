from django.contrib import admin
from .models import (
    WeatherData, GenerationData, LoadData, BatteryData,
    Forecast, EnergyDecision, Alert, SimulationScenario
)

admin.site.register(WeatherData)
admin.site.register(GenerationData)
admin.site.register(LoadData)
admin.site.register(BatteryData)
admin.site.register(Forecast)
admin.site.register(EnergyDecision)
admin.site.register(Alert)
admin.site.register(SimulationScenario)