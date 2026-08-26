from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import (
    WeatherData, GenerationData, LoadData, BatteryData,
    Forecast, EnergyDecision, Alert, SimulationScenario
)
from .serializers import (
    WeatherDataSerializer, GenerationDataSerializer, LoadDataSerializer,
    BatteryDataSerializer, ForecastSerializer, EnergyDecisionSerializer,
    AlertSerializer, SimulationScenarioSerializer
)


class WeatherDataViewSet(viewsets.ModelViewSet):
    queryset = WeatherData.objects.all()
    serializer_class = WeatherDataSerializer


class GenerationDataViewSet(viewsets.ModelViewSet):
    queryset = GenerationData.objects.all()
    serializer_class = GenerationDataSerializer


class LoadDataViewSet(viewsets.ModelViewSet):
    queryset = LoadData.objects.all()
    serializer_class = LoadDataSerializer


class BatteryDataViewSet(viewsets.ModelViewSet):
    queryset = BatteryData.objects.all()
    serializer_class = BatteryDataSerializer


class ForecastViewSet(viewsets.ModelViewSet):
    queryset = Forecast.objects.all()
    serializer_class = ForecastSerializer


class EnergyDecisionViewSet(viewsets.ModelViewSet):
    queryset = EnergyDecision.objects.all()
    serializer_class = EnergyDecisionSerializer


class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer


class SimulationScenarioViewSet(viewsets.ModelViewSet):
    queryset = SimulationScenario.objects.all()
    serializer_class = SimulationScenarioSerializer


@api_view(['GET'])
def live_status(request):
    """
    Combined current-status snapshot for the dashboard.
    Returns the single latest record from each core table.
    """
    weather = WeatherData.objects.first()
    generation = GenerationData.objects.first()
    load = LoadData.objects.first()
    battery = BatteryData.objects.first()
    latest_decision = EnergyDecision.objects.first()
    active_alerts = Alert.objects.filter(status='active')[:5]

    data = {
        "timestamp": generation.timestamp if generation else None,
        "solar_generation_kw": generation.solar_generation if generation else None,
        "wind_generation_kw": generation.wind_generation if generation else None,
        "load_kw": load.consumption if load else None,
        "battery": {
            "soc_percent": battery.soc if battery else None,
            "charge_power_kw": battery.charge_power if battery else None,
            "discharge_power_kw": battery.discharge_power if battery else None,
            "health_percent": battery.health_indicator if battery else None,
        } if battery else None,
        "weather": {
            "temperature": weather.temperature if weather else None,
            "cloud_cover": weather.cloud_cover if weather else None,
            "wind_speed": weather.wind_speed if weather else None,
            "irradiance": weather.irradiance if weather else None,
        } if weather else None,
        "current_decision": {
            "source_selection": latest_decision.source_selection,
            "battery_action": latest_decision.battery_action,
            "grid_action": latest_decision.grid_action,
            "reason": latest_decision.reason,
        } if latest_decision else None,
        "active_alerts": [
            {
                "type": a.alert_type,
                "severity": a.severity,
                "timestamp": a.timestamp,
            } for a in active_alerts
        ],
    }
    return Response(data)


@api_view(['GET'])
def alerts_summary(request):
    """
    Returns active alerts and alert history separately,
    for the Faults/Alerts page.
    """
    active = Alert.objects.filter(status='active').order_by('-timestamp')
    history = Alert.objects.exclude(status='active').order_by('-timestamp')

    return Response({
        'active_alerts': AlertSerializer(active, many=True).data,
        'alert_history': AlertSerializer(history, many=True).data,
        'active_count': active.count(),
    })

@api_view(['GET'])
def forecast_summary(request):
    """
    Returns recent forecasts alongside actual generation/load data
    for comparison, plus simple accuracy metrics.
    """
    forecasts = Forecast.objects.order_by('-timestamp')[:24]

    comparison = []
    total_error_solar = 0
    total_error_wind = 0
    total_error_load = 0
    count = 0

    for f in forecasts:
        actual_gen = GenerationData.objects.filter(timestamp=f.timestamp).first()
        actual_load = LoadData.objects.filter(timestamp=f.timestamp).first()

        actual_solar = actual_gen.solar_generation if actual_gen else None
        actual_wind = actual_gen.wind_generation if actual_gen else None
        actual_load_val = actual_load.consumption if actual_load else None

        if actual_solar is not None:
            total_error_solar += abs(f.predicted_solar - actual_solar)
        if actual_wind is not None:
            total_error_wind += abs(f.predicted_wind - actual_wind)
        if actual_load_val is not None:
            total_error_load += abs(f.predicted_load - actual_load_val)
        if actual_solar is not None or actual_wind is not None or actual_load_val is not None:
            count += 1

        comparison.append({
            'timestamp': f.timestamp,
            'predicted_solar': f.predicted_solar,
            'actual_solar': actual_solar,
            'predicted_wind': f.predicted_wind,
            'actual_wind': actual_wind,
            'predicted_load': f.predicted_load,
            'actual_load': actual_load_val,
        })

    accuracy = {
        'avg_solar_error': round(total_error_solar / count, 2) if count else None,
        'avg_wind_error': round(total_error_wind / count, 2) if count else None,
        'avg_load_error': round(total_error_load / count, 2) if count else None,
    }

    return Response({
        'comparison': comparison,
        'accuracy': accuracy,
    })