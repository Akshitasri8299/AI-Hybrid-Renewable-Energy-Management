import pandas as pd
import numpy as np
from django.core.management.base import BaseCommand
from energy.models import WeatherData, GenerationData, LoadData


class Command(BaseCommand):
    help = "Computes baseline forecasts (previous-value and historical-average) and evaluates them"

    def handle(self, *args, **options):
        generation_qs = GenerationData.objects.all().order_by('timestamp').values(
            'timestamp', 'solar_generation', 'wind_generation'
        )
        load_qs = LoadData.objects.all().order_by('timestamp').values('timestamp', 'consumption')

        gen_df = pd.DataFrame(generation_qs)
        load_df = pd.DataFrame(load_qs)

        if gen_df.empty or load_df.empty:
            self.stdout.write(self.style.ERROR("No data found. Run 'python manage.py seed_data' first."))
            return

        df = gen_df.merge(load_df, on='timestamp')
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['timestamp'].dt.hour
        df = df.sort_values('timestamp').reset_index(drop=True)

        targets = {
            'solar_generation': 'Solar',
            'wind_generation': 'Wind',
            'consumption': 'Load',
        }

        self.stdout.write(self.style.SUCCESS("=== BASELINE FORECAST EVALUATION ===\n"))

        for col, label in targets.items():
            actual = df[col].values

            # Baseline 1: previous-value (naive) - predict this hour = previous hour's actual
            prev_value_pred = np.roll(actual, 1)
            prev_value_pred[0] = actual[0]  # first row has no previous, use itself

            # Baseline 2: historical-average per hour-of-day
            hourly_avg = df.groupby('hour')[col].mean()
            hist_avg_pred = df['hour'].map(hourly_avg).values

            self.stdout.write(f"--- {label} ---")
            self._evaluate(actual, prev_value_pred, "Previous-value baseline")
            self._evaluate(actual, hist_avg_pred, "Historical-average baseline")
            self.stdout.write("")

    def _evaluate(self, actual, predicted, name):
        actual = np.array(actual, dtype=float)
        predicted = np.array(predicted, dtype=float)

        mae = np.mean(np.abs(actual - predicted))
        rmse = np.sqrt(np.mean((actual - predicted) ** 2))

        # MAPE - avoid division by zero
        nonzero_mask = actual != 0
        if nonzero_mask.sum() > 0:
            mape = np.mean(np.abs((actual[nonzero_mask] - predicted[nonzero_mask]) / actual[nonzero_mask])) * 100
        else:
            mape = float('nan')

        self.stdout.write(f"  {name}: MAE={mae:.2f}, RMSE={rmse:.2f}, MAPE={mape:.1f}%")