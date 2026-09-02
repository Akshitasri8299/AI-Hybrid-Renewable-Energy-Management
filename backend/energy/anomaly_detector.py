"""
Fault Detection / Anomaly Detection (Week 9 of roadmap).

Detects abnormal generation by comparing what was forecasted
(expected) against what actually happened, rather than using a
fixed threshold.
"""

DEVIATION_MEDIUM = 30.0
DEVIATION_HIGH = 50.0


def check_generation_anomaly(source_name, expected_value, actual_value, min_expected_for_check=5.0):
    if expected_value is None or actual_value is None:
        return None

    if expected_value < min_expected_for_check:
        return None

    deviation_percent = abs(expected_value - actual_value) / expected_value * 100

    if deviation_percent < DEVIATION_MEDIUM:
        return None

    severity = 'high' if deviation_percent >= DEVIATION_HIGH else 'medium'
    direction = 'below' if actual_value < expected_value else 'above'

    return {
        'alert_type': f'{source_name} Generation Anomaly',
        'severity': severity,
        'expected_value': round(expected_value, 1),
        'actual_value': round(actual_value, 1),
        'deviation_percent': round(deviation_percent, 1),
        'reason': (
            f"{source_name} generation is {round(deviation_percent, 1)}% {direction} the forecasted "
            f"value (expected {round(expected_value, 1)} kW, got {round(actual_value, 1)} kW). "
            f"This deviation is larger than normal weather variability would explain, and may "
            f"indicate a sensor fault, panel/turbine issue, or unexpected obstruction."
        ),
    }


def check_battery_health_trend(health_readings):
    if len(health_readings) < 5:
        return None

    first_half_avg = sum(health_readings[:len(health_readings)//2]) / (len(health_readings)//2)
    second_half_avg = sum(health_readings[len(health_readings)//2:]) / (len(health_readings) - len(health_readings)//2)

    decline = first_half_avg - second_half_avg

    if decline < 1.0:
        return None

    severity = 'high' if decline >= 3.0 else 'medium'

    return {
        'alert_type': 'Battery Health Degradation Trend',
        'severity': severity,
        'expected_value': round(first_half_avg, 1),
        'actual_value': round(second_half_avg, 1),
        'reason': (
            f"Battery health has declined by {round(decline, 1)} percentage points over the "
            f"recent readings (from {round(first_half_avg, 1)}% to {round(second_half_avg, 1)}%). "
            f"This trend suggests accelerated degradation and may warrant inspection."
        ),
    }