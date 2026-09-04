from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    WeatherDataViewSet, GenerationDataViewSet, LoadDataViewSet,
    BatteryDataViewSet, ForecastViewSet, EnergyDecisionViewSet,
    AlertViewSet, SimulationScenarioViewSet, alerts_summary, analytics_summary, live_status,
    forecast_summary, energy_management_summary, simulate_scenario, ai_forecast, baseline_comparison,
    live_decision, test_decision, optimized_decision, test_optimized_decision, anomaly_detection, detect_anomalies,
    login
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
    path('auth/login/', login),
    path('status/live/', live_status),
    path('alerts/summary/', alerts_summary),
    path('forecast/summary/', forecast_summary),
    path('energy-management/summary/', energy_management_summary),
    path('simulate/', simulate_scenario),
    path('analytics/summary/', analytics_summary),
    path('analytics/anomalies/', anomaly_detection),
    path('forecast/predict/', ai_forecast),
    path('forecast/baseline/', baseline_comparison),
    path('decision/live/', live_decision),
    path('decision/test/', test_decision),
    path('decision/optimized/', optimized_decision),
    path('decision/optimized-test/', test_optimized_decision),
    path('anomalies/detect/', detect_anomalies),
] + router.urls