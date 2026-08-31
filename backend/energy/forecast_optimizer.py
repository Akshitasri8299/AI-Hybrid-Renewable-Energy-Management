"""
Forecast-Aware Optimization (Week 8 of roadmap).

Extends the base Energy Management Engine by considering future
forecasts before deciding how aggressively to charge/discharge the
battery right now. The idea: don't fully charge the battery if a
renewable dip is expected soon (keep headroom to absorb it), and
don't fully discharge if a demand spike is expected soon (keep a
reserve to cover it).
"""

from . import decision_engine


# How much extra reserve to keep when a future deficit is expected
RESERVE_BUFFER_PERCENT = 15.0


def optimize_decision(solar_kw, wind_kw, load_kw, battery_soc_percent, upcoming_forecasts):
    """
    Makes a battery/grid decision that accounts for near-future forecasts,
    not just the current instant.

    upcoming_forecasts: list of dicts, each with
        'predicted_solar', 'predicted_wind', 'predicted_load'
        representing the next few hours (soonest first).

    Returns the same shape as decision_engine.make_decision(), plus
    an 'optimization_note' explaining any adjustment made for the forecast.
    """
    base_decision = decision_engine.make_decision(
        solar_kw=solar_kw, wind_kw=wind_kw, load_kw=load_kw,
        battery_soc_percent=battery_soc_percent,
    )

    if not upcoming_forecasts:
        base_decision['optimization_note'] = "No forecast data available; using current-conditions decision only."
        return base_decision

    # Look at the near-term forecast to see if a deficit is coming
    upcoming_deficit_hours = []
    upcoming_surplus_hours = []
    for f in upcoming_forecasts:
        f_renewable = (f.get('predicted_solar') or 0) + (f.get('predicted_wind') or 0)
        f_load = f.get('predicted_load') or 0
        net = f_renewable - f_load
        if net < -5:  # meaningful deficit expected
            upcoming_deficit_hours.append(round(-net, 1))
        elif net > 5:  # meaningful surplus expected
            upcoming_surplus_hours.append(round(net, 1))

    expects_deficit_soon = len(upcoming_deficit_hours) > 0
    expects_surplus_soon = len(upcoming_surplus_hours) > 0

    # Case 1: currently charging, but a deficit is coming soon -> cap the charge, keep reserve
    if base_decision['battery_action'] == 'charge' and expects_deficit_soon:
        max_deficit = max(upcoming_deficit_hours)
        target_soc_ceiling = min(95.0, 100.0 - RESERVE_BUFFER_PERCENT)

        if battery_soc_percent >= target_soc_ceiling:
            base_decision['battery_action'] = 'idle'
            base_decision['grid_action'] = 'export'
            base_decision['grid_power_kw'] = base_decision['battery_power_kw']
            base_decision['battery_power_kw'] = 0
            base_decision['optimization_note'] = (
                f"A generation deficit of up to {max_deficit} kW is expected in the coming hours. "
                f"Battery is already at or above the {target_soc_ceiling:.0f}% reserve ceiling, so "
                f"surplus is being exported instead of charging further, preserving headroom for the "
                f"upcoming deficit."
            )
        else:
            base_decision['optimization_note'] = (
                f"A generation deficit of up to {max_deficit} kW is expected in the coming hours. "
                f"Continuing to charge since battery ({battery_soc_percent:.0f}%) is still below the "
                f"{target_soc_ceiling:.0f}% reserve ceiling."
            )

    # Case 2: currently discharging, but a surplus is coming soon -> discharge a bit more freely
    elif base_decision['battery_action'] == 'discharge' and expects_surplus_soon:
        base_decision['optimization_note'] = (
            f"A renewable surplus of up to {max(upcoming_surplus_hours):.1f} kW is expected soon, "
            f"so the battery can be used more freely now since it will have a chance to recharge shortly."
        )

    # Case 3: currently discharging, and ANOTHER deficit is expected soon -> be more conservative
    elif base_decision['battery_action'] == 'discharge' and expects_deficit_soon:
        base_decision['optimization_note'] = (
            f"Note: further deficits (up to {max(upcoming_deficit_hours):.1f} kW) are expected soon. "
            f"Monitor battery levels closely as reserves may be needed again shortly."
        )

    else:
        base_decision['optimization_note'] = "Forecast reviewed; no adjustment needed to the current-conditions decision."

    base_decision['forecast_context'] = {
        'hours_analyzed': len(upcoming_forecasts),
        'upcoming_deficit_hours': len(upcoming_deficit_hours),
        'upcoming_surplus_hours': len(upcoming_surplus_hours),
        'max_upcoming_deficit_kw': max(upcoming_deficit_hours) if upcoming_deficit_hours else 0,
        'max_upcoming_surplus_kw': max(upcoming_surplus_hours) if upcoming_surplus_hours else 0,
    }

    return base_decision