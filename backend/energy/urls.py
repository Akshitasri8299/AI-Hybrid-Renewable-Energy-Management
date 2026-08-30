from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    WeatherDataViewSet, GenerationDataViewSet, LoadDataViewSet,
    BatteryDataViewSet, ForecastViewSet, EnergyDecisionViewSet,
    AlertViewSet, SimulationScenarioViewSet, alerts_summary, analytics_summary, live_status,
        forecast_summary, energy_management_summary, simulate_scenario,ai_forecast, baseline_comparison
    )

router = DefaultRouter()
router.register(r'weather', WeatherDataViewSet)
router.register(r'generation', GenerationDataViewSet)
router.register(r'load', LoadDataViewSet)
router.register(r'battery', BatteryDataViewSet)
router.register(r'forecast', ForecastViewSet)
router.register(r'decisions', EnergyDecisionViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'scenarios', SimulationScenarioViewSet)

urlpatterns = [
    path('status/live/', live_status),
    path('alerts/summary/', alerts_summary),
    path('forecast/summary/', forecast_summary),
    path('energy-management/summary/', energy_management_summary),
    path('simulate/', simulate_scenario),
    path('analytics/summary/', analytics_summary),
    path('forecast/predict/', ai_forecast),
    path('forecast/baseline/', baseline_comparison),
] + router.urls