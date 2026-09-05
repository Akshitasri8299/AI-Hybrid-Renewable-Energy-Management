"""
AI vs Conventional Comparison (Week 11 of roadmap).
"""

from . import decision_engine

GRID_RATE_PER_KWH = 8
CO2_FACTOR_KG_PER_KWH = 0.82


def simulate_conventional(hourly_records):
    total_grid_import = 0
    total_wastage = 0

    for r in hourly_records:
        renewable = r['solar_kw'] + r['wind_kw']
        net = renewable - r['load_kw']

        if net >= 0:
            total_wastage += net
        else:
            total_grid_import += abs(net)

    return {
        'total_grid_import_kwh': round(total_grid_import, 1),
        'total_wastage_kwh': round(total_wastage, 1),
    }


def simulate_ai(hourly_records, starting_soc=60.0):
    battery_soc = starting_soc
    total_grid_import = 0
    total_wastage = 0

    for r in hourly_records:
        decision = decision_engine.make_decision(
            solar_kw=r['solar_kw'], wind_kw=r['wind_kw'],
            load_kw=r['load_kw'], battery_soc_percent=battery_soc,
        )

        if decision['grid_action'] == 'import':
            total_grid_import += decision.get('grid_power_kw', 0)
        if decision['grid_action'] == 'export':
            total_wastage += decision.get('grid_power_kw', 0)

        if decision['battery_action'] == 'charge':
            battery_soc = min(95, battery_soc + decision['battery_power_kw'] * 0.3)
        elif decision['battery_action'] == 'discharge':
            battery_soc = max(15, battery_soc - decision['battery_power_kw'] * 0.3)

    return {
        'total_grid_import_kwh': round(total_grid_import, 1),
        'total_wastage_kwh': round(total_wastage, 1),
    }


def compare(hourly_records):
    conventional = simulate_conventional(hourly_records)
    ai = simulate_ai(hourly_records)

    conventional_cost = round(conventional['total_grid_import_kwh'] * GRID_RATE_PER_KWH, 2)
    ai_cost = round(ai['total_grid_import_kwh'] * GRID_RATE_PER_KWH, 2)
    cost_saved = round(conventional_cost - ai_cost, 2)

    conventional_co2 = round(conventional['total_grid_import_kwh'] * CO2_FACTOR_KG_PER_KWH, 2)
    ai_co2 = round(ai['total_grid_import_kwh'] * CO2_FACTOR_KG_PER_KWH, 2)
    co2_saved = round(conventional_co2 - ai_co2, 2)

    grid_reduction_percent = (
        round((1 - ai['total_grid_import_kwh'] / conventional['total_grid_import_kwh']) * 100, 1)
        if conventional['total_grid_import_kwh'] > 0 else 0
    )

    return {
        'conventional': {
            'grid_import_kwh': conventional['total_grid_import_kwh'],
            'wastage_kwh': conventional['total_wastage_kwh'],
            'estimated_cost_inr': conventional_cost,
            'estimated_co2_kg': conventional_co2,
        },
        'ai_optimized': {
            'grid_import_kwh': ai['total_grid_import_kwh'],
            'wastage_kwh': ai['total_wastage_kwh'],
            'estimated_cost_inr': ai_cost,
            'estimated_co2_kg': ai_co2,
        },
        'improvement': {
            'grid_import_reduction_percent': grid_reduction_percent,
            'cost_saved_inr': cost_saved,
            'co2_saved_kg': co2_saved,
        },
        'hours_analyzed': len(hourly_records),
    }