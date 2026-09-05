from . import anomaly_detector
from . import forecast_optimizer
from . import decision_engine
from . import ml_predict
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
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
    forecasts = Forecast.objects.order_by('-timestamp')[:24][::-1]

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


@api_view(['GET'])
def energy_management_summary(request):
    """
    Returns current energy flow snapshot plus recent decision history,
    for the Energy Management page.
    """
    generation = GenerationData.objects.first()
    load = LoadData.objects.first()
    battery = BatteryData.objects.first()

    recent_decisions = EnergyDecision.objects.order_by('-timestamp')[:10]

    flow = {
        'solar_generation_kw': generation.solar_generation if generation else None,
        'wind_generation_kw': generation.wind_generation if generation else None,
        'load_kw': load.consumption if load else None,
        'battery_soc_percent': battery.soc if battery else None,
        'battery_charge_kw': battery.charge_power if battery else None,
        'battery_discharge_kw': battery.discharge_power if battery else None,
    }

    decision_log = [
        {
            'timestamp': d.timestamp,
            'source_selection': d.source_selection,
            'battery_action': d.battery_action,
            'grid_action': d.grid_action,
            'reason': d.reason,
        } for d in recent_decisions
    ]

    return Response({
        'current_flow': flow,
        'decision_log': decision_log,
    })


@api_view(['GET'])
def simulate_scenario(request):
    """
    Accepts a scenario name via query param (?scenario=cloudy_day)
    and returns simulated energy values for that scenario.
    """
    scenario = request.GET.get('scenario', '').lower()

    baseline = {
        'solar_generation_kw': 60,
        'wind_generation_kw': 20,
        'load_kw': 50,
        'battery_soc_percent': 70,
        'grid_import_kw': 0,
    }

    result = dict(baseline)
    description = ''

    if scenario == 'cloudy_day':
        result['solar_generation_kw'] = round(baseline['solar_generation_kw'] * 0.2, 1)
        description = 'Solar output drops sharply due to heavy cloud cover.'
    elif scenario == 'high_demand':
        result['load_kw'] = round(baseline['load_kw'] * 1.8, 1)
        description = 'Load demand spikes well above normal levels.'
    elif scenario == 'low_wind':
        result['wind_generation_kw'] = round(baseline['wind_generation_kw'] * 0.15, 1)
        description = 'Wind generation drops due to low wind speeds.'
    elif scenario == 'low_battery':
        result['battery_soc_percent'] = 15
        description = 'Battery state of charge is critically low.'
    elif scenario == 'grid_outage':
        result['grid_import_kw'] = 0
        description = 'Grid connection is unavailable; system relies fully on renewables and battery.'
    else:
        return Response({'error': 'Unknown scenario. Use one of: cloudy_day, high_demand, low_wind, low_battery, grid_outage'}, status=400)

    total_generation = result['solar_generation_kw'] + result['wind_generation_kw']
    net_balance = round(total_generation - result['load_kw'], 1)

    result['total_generation_kw'] = round(total_generation, 1)
    result['net_balance_kw'] = net_balance
    result['status'] = 'surplus' if net_balance >= 0 else 'deficit'

    return Response({
        'scenario': scenario,
        'description': description,
        'baseline': baseline,
        'result': result,
    })


@api_view(['GET'])
def analytics_summary(request):
    """
    Computes high-level KPIs from stored generation/load data,
    for the Analytics page. Wastage is computed per-hour (not on
    totals) so it correctly reflects moments where renewable
    generation exceeded load even if the 7-day totals don't.
    """
    generation_records = list(GenerationData.objects.all().order_by('timestamp'))
    load_by_timestamp = {l.timestamp: l.consumption for l in LoadData.objects.all()}

    if not generation_records:
        return Response({
            'renewable_utilization_percent': None,
            'energy_wastage_kwh': None,
            'cost_savings_inr': None,
            'co2_savings_kg': None,
            'assumptions': {},
        })

    total_renewable = 0
    total_load = 0
    total_wastage = 0
    total_renewable_used = 0

    for g in generation_records:
        renewable_at_hour = g.solar_generation + g.wind_generation
        load_at_hour = load_by_timestamp.get(g.timestamp, 0)

        total_renewable += renewable_at_hour
        total_load += load_at_hour

        # Wastage: renewable that exceeded load THIS hour (can't be used or stored beyond capacity)
        surplus = renewable_at_hour - load_at_hour
        if surplus > 0:
            total_wastage += surplus
            total_renewable_used += load_at_hour
        else:
            total_renewable_used += renewable_at_hour

    renewable_utilization = round(min(total_renewable / total_load, 1) * 100, 1) if total_load > 0 else None
    energy_wastage = round(total_wastage, 1)

    GRID_RATE_PER_KWH = 8
    CO2_FACTOR_KG_PER_KWH = 0.82

    cost_savings = round(total_renewable_used * GRID_RATE_PER_KWH, 2)
    co2_savings = round(total_renewable_used * CO2_FACTOR_KG_PER_KWH, 2)

    return Response({
        'renewable_utilization_percent': renewable_utilization,
        'energy_wastage_kwh': energy_wastage,
        'cost_savings_inr': cost_savings,
        'co2_savings_kg': co2_savings,
        'assumptions': {
            'grid_rate_per_kwh': GRID_RATE_PER_KWH,
            'co2_factor_kg_per_kwh': CO2_FACTOR_KG_PER_KWH,
        }
    })


@api_view(['GET'])
def ai_forecast(request):
    """
    Real AI-based forecast using the trained ML models.
    Uses the most recent weather reading, or accepts overrides via query params.
    Example: /api/forecast/predict/?hour=14&temperature=28&cloud_cover=20
    """
    latest_weather = WeatherData.objects.first()

    def get_param(name, default):
        val = request.GET.get(name)
        return float(val) if val is not None else default

    hour = int(get_param('hour', latest_weather.timestamp.hour if latest_weather else 12))
    temperature = get_param('temperature', latest_weather.temperature if latest_weather else 25)
    humidity = get_param('humidity', latest_weather.humidity if latest_weather else 50)
    cloud_cover = get_param('cloud_cover', latest_weather.cloud_cover if latest_weather else 30)
    wind_speed = get_param('wind_speed', latest_weather.wind_speed if latest_weather else 6)
    irradiance = get_param('irradiance', latest_weather.irradiance if latest_weather else 400)

    try:
        prediction = ml_predict.predict(hour, temperature, humidity, cloud_cover, wind_speed, irradiance)
    except FileNotFoundError:
        return Response({'error': 'Models not trained yet. Run train_forecast_model.py first.'}, status=500)

    return Response({
        'inputs': {
            'hour': hour,
            'temperature': temperature,
            'humidity': humidity,
            'cloud_cover': cloud_cover,
            'wind_speed': wind_speed,
            'irradiance': irradiance,
        },
        'prediction': prediction,
        'model': 'RandomForestRegressor (trained on 7 days of historical data)',
    })


@api_view(['GET'])
def baseline_comparison(request):
    """
    Compares the trained ML model against simple baselines
    (previous-value and historical-average) for solar, wind, and load.
    """
    import pandas as pd
    import numpy as np

    generation_qs = GenerationData.objects.all().order_by('timestamp').values(
        'timestamp', 'solar_generation', 'wind_generation'
    )
    load_qs = LoadData.objects.all().order_by('timestamp').values('timestamp', 'consumption')
    weather_qs = WeatherData.objects.all().order_by('timestamp').values(
        'timestamp', 'temperature', 'humidity', 'cloud_cover', 'wind_speed', 'irradiance'
    )

    gen_df = pd.DataFrame(generation_qs)
    load_df = pd.DataFrame(load_qs)
    weather_df = pd.DataFrame(weather_qs)

    if gen_df.empty or load_df.empty:
        return Response({'error': 'No data available. Run seed_data first.'}, status=400)

    df = gen_df.merge(load_df, on='timestamp').merge(weather_df, on='timestamp')
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df = df.sort_values('timestamp').reset_index(drop=True)

    def evaluate(actual, predicted):
        actual = np.array(actual, dtype=float)
        predicted = np.array(predicted, dtype=float)
        mae = float(np.mean(np.abs(actual - predicted)))
        rmse = float(np.sqrt(np.mean((actual - predicted) ** 2)))
        nonzero = actual != 0
        mape = float(np.mean(np.abs((actual[nonzero] - predicted[nonzero]) / actual[nonzero])) * 100) if nonzero.sum() > 0 else None
        return {'mae': round(mae, 2), 'rmse': round(rmse, 2), 'mape': round(mape, 1) if mape else None}

    targets = {
        'solar_generation': 'solar',
        'wind_generation': 'wind',
        'consumption': 'load',
    }

    results = {}
    for col, key in targets.items():
        actual = df[col].values

        prev_pred = np.roll(actual, 1)
        prev_pred[0] = actual[0]

        hourly_avg = df.groupby('hour')[col].mean()
        hist_pred = df['hour'].map(hourly_avg).values

        # ML model predictions on the same historical rows
        try:
            ml_preds = []
            for _, row in df.iterrows():
                features = [[row['hour'], row['temperature'], row['humidity'],
                             row['cloud_cover'], row['wind_speed'], row['irradiance']]]
                if key == 'solar':
                    ml_preds.append(ml_predict._solar_model.predict(features)[0] if ml_predict._solar_model else None)
            ml_available = key == 'solar' and len(ml_preds) > 0
        except Exception:
            ml_available = False

        results[key] = {
            'previous_value_baseline': evaluate(actual, prev_pred),
            'historical_average_baseline': evaluate(actual, hist_pred),
        }

    return Response({
        'comparison': results,
        'note': 'Lower MAE/RMSE/MAPE = better. Compare against /api/forecast/predict/ model performance separately.',
        'rows_evaluated': len(df),
    })


@api_view(['GET'])
def live_decision(request):
    """
    Runs the Energy Management Engine on the latest data
    and returns the recommended decision with full reasoning.
    """
    generation = GenerationData.objects.first()
    load = LoadData.objects.first()
    battery = BatteryData.objects.first()

    if not generation or not load or not battery:
        return Response({'error': 'Not enough data available.'}, status=400)

    decision = decision_engine.make_decision(
        solar_kw=generation.solar_generation,
        wind_kw=generation.wind_generation,
        load_kw=load.consumption,
        battery_soc_percent=battery.soc,
    )

    return Response({
        'inputs': {
            'solar_kw': generation.solar_generation,
            'wind_kw': generation.wind_generation,
            'load_kw': load.consumption,
            'battery_soc_percent': battery.soc,
        },
        'decision': decision,
    })


@api_view(['GET'])
def test_decision(request):
    """
    Test the decision engine with custom input values via query params.
    Example: /api/decision/test/?solar=60&wind=20&load=40&battery=50
    """
    solar = float(request.GET.get('solar', 0))
    wind = float(request.GET.get('wind', 0))
    load = float(request.GET.get('load', 50))
    battery = float(request.GET.get('battery', 50))

    decision = decision_engine.make_decision(
        solar_kw=solar, wind_kw=wind, load_kw=load, battery_soc_percent=battery
    )

    return Response({
        'inputs': {'solar_kw': solar, 'wind_kw': wind, 'load_kw': load, 'battery_soc_percent': battery},
        'decision': decision,
    })


@api_view(['GET'])
def optimized_decision(request):
    """
    Forecast-aware version of the live decision endpoint.
    Looks at the next few forecasted hours before deciding
    how aggressively to charge/discharge the battery.
    """
    generation = GenerationData.objects.first()
    load = LoadData.objects.first()
    battery = BatteryData.objects.first()

    if not generation or not load or not battery:
        return Response({'error': 'Not enough data available.'}, status=400)

    upcoming = list(
        Forecast.objects.order_by('-timestamp')[:3]
        .values('target_time', 'predicted_solar', 'predicted_wind', 'predicted_load')
    )

    decision = forecast_optimizer.optimize_decision(
        solar_kw=generation.solar_generation,
        wind_kw=generation.wind_generation,
        load_kw=load.consumption,
        battery_soc_percent=battery.soc,
        upcoming_forecasts=upcoming,
    )

    return Response({
        'inputs': {
            'solar_kw': generation.solar_generation,
            'wind_kw': generation.wind_generation,
            'load_kw': load.consumption,
            'battery_soc_percent': battery.soc,
        },
        'upcoming_forecasts_used': upcoming,
        'decision': decision,
    })


@api_view(['GET'])
def test_optimized_decision(request):
    """
    Test the forecast-aware optimizer with custom current values
    AND custom upcoming forecast values, via query params.
    Example: /api/decision/optimized-test/?solar=60&wind=20&load=40&battery=90
             &f1_solar=10&f1_wind=15&f1_load=45
    """
    solar = float(request.GET.get('solar', 0))
    wind = float(request.GET.get('wind', 0))
    load = float(request.GET.get('load', 50))
    battery = float(request.GET.get('battery', 50))

    # Optional: one upcoming forecast hour, provided via query params
    upcoming = []
    if request.GET.get('f1_solar') is not None:
        upcoming.append({
            'target_time': 'next_hour',
            'predicted_solar': float(request.GET.get('f1_solar', 0)),
            'predicted_wind': float(request.GET.get('f1_wind', 0)),
            'predicted_load': float(request.GET.get('f1_load', 0)),
        })

    decision = forecast_optimizer.optimize_decision(
        solar_kw=solar, wind_kw=wind, load_kw=load, battery_soc_percent=battery,
        upcoming_forecasts=upcoming,
    )

    return Response({
        'inputs': {'solar_kw': solar, 'wind_kw': wind, 'load_kw': load, 'battery_soc_percent': battery},
        'upcoming_forecasts_used': upcoming,
        'decision': decision,
    })


@api_view(['GET'])
def anomaly_detection(request):
    """
    Flags recent anomalies: generation deviating far from forecast,
    and battery health degrading noticeably.
    """
    anomalies = []
    SOLAR_THRESHOLD = 3    # kW deviation considered anomalous
    WIND_THRESHOLD = 2

    recent_forecasts = Forecast.objects.order_by('-timestamp')[:100]

    for f in recent_forecasts:
        actual_gen = GenerationData.objects.filter(timestamp=f.target_time).first()
        if not actual_gen:
            continue

        if f.predicted_solar is not None:
            solar_diff = abs(actual_gen.solar_generation - f.predicted_solar)
            if solar_diff > SOLAR_THRESHOLD:
                anomalies.append({
                    'type': 'Solar generation deviation',
                    'timestamp': f.target_time,
                    'expected': f.predicted_solar,
                    'actual': actual_gen.solar_generation,
                    'deviation': round(solar_diff, 1),
                })

        if f.predicted_wind is not None:
            wind_diff = abs(actual_gen.wind_generation - f.predicted_wind)
            if wind_diff > WIND_THRESHOLD:
                anomalies.append({
                    'type': 'Wind generation deviation',
                    'timestamp': f.target_time,
                    'expected': f.predicted_wind,
                    'actual': actual_gen.wind_generation,
                    'deviation': round(wind_diff, 1),
                })

    recent_battery = list(BatteryData.objects.order_by('-timestamp')[:48])
    if len(recent_battery) >= 2:
        latest = recent_battery[0]
        oldest = recent_battery[-1]
        health_drop = oldest.health_indicator - latest.health_indicator
        if health_drop > 1:
            anomalies.append({
                'type': 'Battery health degradation',
                'timestamp': latest.timestamp,
                'expected': oldest.health_indicator,
                'actual': latest.health_indicator,
                'deviation': round(health_drop, 1),
            })

    anomalies.sort(key=lambda a: a['timestamp'], reverse=True)

    return Response({
        'anomalies': anomalies[:20],
        'count': len(anomalies),
    })


@api_view(['GET'])
def detect_anomalies(request):
    """
    Scans recent forecast-vs-actual data and battery health trends
    to detect anomalies (Week 9: Fault Detection).
    """
    anomalies = []

    # Check the most recent 10 forecasts against actual generation
    recent_forecasts = Forecast.objects.order_by('-target_time')[:10]

    for f in recent_forecasts:
        actual_gen = GenerationData.objects.filter(timestamp=f.target_time).first()
        if not actual_gen:
            continue

        solar_anomaly = anomaly_detector.check_generation_anomaly(
            'Solar', f.predicted_solar, actual_gen.solar_generation
        )
        if solar_anomaly:
            solar_anomaly['timestamp'] = f.target_time
            anomalies.append(solar_anomaly)

        wind_anomaly = anomaly_detector.check_generation_anomaly(
            'Wind', f.predicted_wind, actual_gen.wind_generation
        )
        if wind_anomaly:
            wind_anomaly['timestamp'] = f.target_time
            anomalies.append(wind_anomaly)

    # Check battery health trend over the last 20 readings
    recent_battery = list(BatteryData.objects.order_by('timestamp')[:20].values_list('health_indicator', flat=True))
    health_anomaly = anomaly_detector.check_battery_health_trend(recent_battery)
    if health_anomaly:
        health_anomaly['timestamp'] = None
        anomalies.append(health_anomaly)

    return Response({
        'anomalies_found': len(anomalies),
        'anomalies': anomalies,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Please provide both email and password.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)
    if not user:
        return Response(
            {'error': 'Invalid credentials. Please check your email and password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token, _ = Token.objects.get_or_create(user=user)

    role = 'admin' if user.is_superuser else ('staff' if user.is_staff else 'user')

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
        },
    })


@api_view(['POST'])
def logout(request):
    try:
        token = Token.objects.get(user=request.user)
        token.delete()
    except Token.DoesNotExist:
        pass
    return Response({'success': True})