from django.utils import timezone
from energy.models import Alert

now = timezone.now()

Alert.objects.create(
    timestamp=now,
    alert_type='Low Battery Warning',
    severity='medium',
    expected_value=30.0,
    actual_value=12.8,
    status='active',
)

Alert.objects.create(
    timestamp=now,
    alert_type='Solar Generation Below Forecast',
    severity='low',
    expected_value=40.0,
    actual_value=0.0,
    status='active',
)

Alert.objects.create(
    timestamp=now,
    alert_type='Wind Turbine Output Spike',
    severity='high',
    expected_value=20.0,
    actual_value=31.1,
    status='active',
)

print("Created 3 sample active alerts.")