from energy.models import Alert

# Take the oldest 10 active alerts and mark them as resolved
# so Alert History has something to show
oldest_alerts = Alert.objects.filter(status='active').order_by('timestamp')[:10]

count = 0
for alert in oldest_alerts:
    alert.status = 'resolved'
    alert.save()
    count += 1

print(f"Marked {count} alerts as resolved (moved to Alert History).")