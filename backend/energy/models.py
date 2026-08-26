from django.db import models


class WeatherData(models.Model):
    timestamp = models.DateTimeField(db_index=True)
    temperature = models.FloatField(help_text="Celsius")
    humidity = models.FloatField(help_text="Percentage")
    cloud_cover = models.FloatField(help_text="Percentage 0-100")
    wind_speed = models.FloatField(help_text="m/s")
    irradiance = models.FloatField(help_text="W/m^2")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Weather @ {self.timestamp}"


class GenerationData(models.Model):
    timestamp = models.DateTimeField(db_index=True)
    solar_generation = models.FloatField(help_text="kW")
    wind_generation = models.FloatField(help_text="kW")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Generation @ {self.timestamp}"


class LoadData(models.Model):
    timestamp = models.DateTimeField(db_index=True)
    consumption = models.FloatField(help_text="kW")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Load @ {self.timestamp}"


class BatteryData(models.Model):
    timestamp = models.DateTimeField(db_index=True)
    soc = models.FloatField(help_text="State of charge, percentage 0-100")
    charge_power = models.FloatField(default=0, help_text="kW, positive=charging")
    discharge_power = models.FloatField(default=0, help_text="kW, positive=discharging")
    health_indicator = models.FloatField(help_text="Percentage 0-100, battery health")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Battery @ {self.timestamp} - SOC {self.soc}%"


class Forecast(models.Model):
    timestamp = models.DateTimeField(db_index=True, help_text="When forecast was generated")
    target_time = models.DateTimeField(db_index=True, help_text="Time being forecasted")
    predicted_solar = models.FloatField(null=True, blank=True)
    predicted_wind = models.FloatField(null=True, blank=True)
    predicted_load = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Forecast for {self.target_time}"


class EnergyDecision(models.Model):
    SOURCE_CHOICES = [
        ('solar', 'Solar'),
        ('wind', 'Wind'),
        ('battery', 'Battery'),
        ('grid', 'Grid'),
        ('mixed', 'Mixed'),
    ]
    BATTERY_ACTION_CHOICES = [
        ('charge', 'Charge'),
        ('discharge', 'Discharge'),
        ('idle', 'Idle'),
    ]
    GRID_ACTION_CHOICES = [
        ('import', 'Import'),
        ('export', 'Export'),
        ('none', 'None'),
    ]

    timestamp = models.DateTimeField(db_index=True)
    source_selection = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    battery_action = models.CharField(max_length=20, choices=BATTERY_ACTION_CHOICES)
    grid_action = models.CharField(max_length=20, choices=GRID_ACTION_CHOICES)
    reason = models.TextField(help_text="Explainable reason for this decision")

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Decision @ {self.timestamp}: {self.source_selection}"


class Alert(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
    ]

    timestamp = models.DateTimeField(db_index=True)
    alert_type = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    expected_value = models.FloatField(null=True, blank=True)
    actual_value = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.severity.upper()} alert: {self.alert_type} @ {self.timestamp}"


class SimulationScenario(models.Model):
    name = models.CharField(max_length=100)
    parameters = models.JSONField(help_text="Scenario input parameters as JSON")
    results = models.JSONField(null=True, blank=True, help_text="Scenario output results as JSON")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name