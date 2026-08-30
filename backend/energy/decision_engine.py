"""
Energy Management Engine (Week 7 of roadmap).

Implements:
- Battery SOC constraints (no overcharge, no deep discharge)
- Renewable-first source selection
- Battery use during renewable deficits
- Grid fallback when renewable + battery are insufficient
- Explainable decision reasoning
"""

# Battery safety limits
BATTERY_MIN_SOC = 15.0   # never discharge below this (protects battery health)
BATTERY_MAX_SOC = 95.0   # never charge above this (protects battery health)
BATTERY_MAX_CHARGE_KW = 30.0     # max charging power the battery can accept
BATTERY_MAX_DISCHARGE_KW = 30.0  # max discharging power the battery can provide


def make_decision(solar_kw, wind_kw, load_kw, battery_soc_percent):
    """
    Decides how to meet the current load given renewable generation
    and battery state, following a renewable-first strategy with
    safe battery operating limits.

    Returns a dict with source_selection, battery_action, grid_action,
    battery_power_kw, grid_power_kw, and a human-readable reason.
    """
    renewable_kw = solar_kw + wind_kw
    net_kw = renewable_kw - load_kw  # positive = surplus, negative = deficit

    if net_kw >= 0:
        can_charge = BATTERY_MAX_SOC - battery_soc_percent > 0
        if can_charge and net_kw > 0:
            charge_power = min(net_kw, BATTERY_MAX_CHARGE_KW)
            source = 'solar' if solar_kw >= wind_kw else 'wind'
            if solar_kw > 0 and wind_kw > 0:
                source = 'mixed'
            return {
                'source_selection': source,
                'battery_action': 'charge',
                'grid_action': 'none',
                'battery_power_kw': round(charge_power, 1),
                'grid_power_kw': 0,
                'reason': (
                    f"Renewable generation ({renewable_kw:.1f} kW) exceeds load "
                    f"({load_kw:.1f} kW). Surplus of {net_kw:.1f} kW is charging the battery "
                    f"(SOC {battery_soc_percent:.0f}% -> below max limit of {BATTERY_MAX_SOC:.0f}%)."
                ),
            }
        else:
            source = 'solar' if solar_kw >= wind_kw else 'wind'
            if solar_kw > 0 and wind_kw > 0:
                source = 'mixed'
            return {
                'source_selection': source,
                'battery_action': 'idle',
                'grid_action': 'export' if net_kw > 0 else 'none',
                'battery_power_kw': 0,
                'grid_power_kw': round(net_kw, 1) if net_kw > 0 else 0,
                'reason': (
                    f"Renewable generation covers load, but battery is near max SOC "
                    f"({battery_soc_percent:.0f}%). Surplus of {net_kw:.1f} kW is being exported "
                    f"to the grid rather than wasted."
                ),
            }
    else:
        deficit_kw = abs(net_kw)
        available_battery_kw = min(BATTERY_MAX_DISCHARGE_KW, battery_soc_percent - BATTERY_MIN_SOC) \
            if battery_soc_percent > BATTERY_MIN_SOC else 0
        available_battery_kw = max(0, available_battery_kw)

        if available_battery_kw >= deficit_kw:
            return {
                'source_selection': 'battery',
                'battery_action': 'discharge',
                'grid_action': 'none',
                'battery_power_kw': round(deficit_kw, 1),
                'grid_power_kw': 0,
                'reason': (
                    f"Renewable generation ({renewable_kw:.1f} kW) is below load "
                    f"({load_kw:.1f} kW) by {deficit_kw:.1f} kW. Battery (SOC "
                    f"{battery_soc_percent:.0f}%, above min limit of {BATTERY_MIN_SOC:.0f}%) "
                    f"is covering the full deficit without grid import."
                ),
            }
        elif available_battery_kw > 0:
            grid_kw = deficit_kw - available_battery_kw
            return {
                'source_selection': 'grid',
                'battery_action': 'discharge',
                'grid_action': 'import',
                'battery_power_kw': round(available_battery_kw, 1),
                'grid_power_kw': round(grid_kw, 1),
                'reason': (
                    f"Deficit of {deficit_kw:.1f} kW exceeds what the battery can safely "
                    f"provide ({available_battery_kw:.1f} kW before hitting the {BATTERY_MIN_SOC:.0f}% "
                    f"minimum SOC limit). Importing remaining {grid_kw:.1f} kW from the grid."
                ),
            }
        else:
            return {
                'source_selection': 'grid',
                'battery_action': 'idle',
                'grid_action': 'import',
                'battery_power_kw': 0,
                'grid_power_kw': round(deficit_kw, 1),
                'reason': (
                    f"Battery SOC ({battery_soc_percent:.0f}%) is at or below the minimum "
                    f"safe limit ({BATTERY_MIN_SOC:.0f}%), so it cannot discharge further. "
                    f"Importing full deficit of {deficit_kw:.1f} kW from the grid to protect "
                    f"battery health."
                ),
            }