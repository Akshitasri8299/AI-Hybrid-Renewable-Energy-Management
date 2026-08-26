from rest_framework import serializers
from .models import (
    WeatherData, GenerationData, LoadData, BatteryData,
    Forecast, EnergyDecision, Alert, SimulationScenario
)


class WeatherDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = '__all__'


class GenerationDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = GenerationData
        fields = '__all__'


class LoadDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoadData
        fields = '__all__'


class BatteryDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatteryData
        fields = '__all__'


class ForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forecast
        fields = '__all__'


class EnergyDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyDecision
        fields = '__all__'


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'


class SimulationScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationScenario
        fields = '__all__'