from energy.models import BatteryData, Alert

# Clear old alerts first (optional, keeps things clean)
Alert.objects.all().delete()

THRESHOLD = 30  # SOC % below which we consider battery "low"

battery_records = BatteryData.objects.all().order_by('timestamp')
count = 0

for b in battery_records:
    if b.soc < THRESHOLD:
        severity = 'high' if b.soc < 15 else 'medium'
        Alert.objects.create(
            timestamp=b.timestamp,
            alert_type='Low Battery',
            severity=severity,
            expected_value=THRESHOLD,
            actual_value=b.soc,
            status='active',
        )
        count += 1

print(f"Created {count} Low Battery alerts based on actual battery data.")