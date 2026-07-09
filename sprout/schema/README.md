# Sprout grid history schema

Persist every CAISO / EIA pull as research history — not only the on-screen state.

## Why keep raw history

| Variable | What it is | Why track it separately |
|---|---|---|
| `price_per_mwh` | Market signal | TOU / wholesale cost story |
| `grid_state` / `stress_score` | Derived physical-strain proxy (load vs capacity, LMP volatility, etc.) | Usually moves with price, but not always — the **gap** is thesis-relevant for market redesign |
| Spike **events** | Discrete episodes above a threshold | Narratable: peak, duration, what coincided — not just a jagged line |

## Core tables

### `grid_readings` (continuous series)

```
timestamp, region, price_per_mwh, demand_mw, grid_state, source
```

Plus optional: `capacity_mw`, `lmp_volatility`, `stress_score`, `source_detail`, `notes`.

`grid_state` ∈ `calm` | `moderate` | `stressed` (maps to the site’s relaxed / climbing / peak UI).

### `spike_events` (event log)

For each spike: `started_at`, `ended_at`, `duration_minutes`, peak price/stress/demand, `threshold_kind` + `threshold_value`, and `coincidence` (`evening_ramp`, `heat_wave`, `outage_elsewhere`, `cold_snap`, `unknown`, or free text).

### `stress_thresholds`

Versioned classification rules so threshold changes don’t silently rewrite history.

## Graphs that fall out of the table

1. Time series of price / demand  
2. Overlay of three-state classification vs actual price (sanity-check thresholds)  
3. Spike frequency by hour-of-day or month → simple research output: *“AI-era regional demand is most likely to overlap with peak human demand during window X”*

Views included in SQL: `v_stress_by_hour`, `v_spikes_by_month`, `v_price_by_grid_state`.

## CSV fallback (same columns)

If SQLite isn’t ready on the Pi yet, append one line per pull:

```csv
timestamp,region,price_per_mwh,demand_mw,grid_state,source
2026-07-09T20:15:00Z,CAISO,74.2,31245,moderate,CAISO
```

Spike CSV (separate file):

```csv
region,started_at,ended_at,duration_minutes,peak_price_per_mwh,peak_stress_score,threshold_kind,threshold_value,coincidence,source
CAISO,2026-07-09T23:00:00Z,2026-07-10T02:10:00Z,190,156.0,0.91,composite,0.75,evening_ramp,CAISO
```

## Methodological note (use in paper / blog / deck)

Sprout’s **grid stress** is a **derived / simplified indicator**, not a direct measurement of data-center load. There is no public feed of individual facility consumption. What is measured is **regional grid demand and price**, which data centers contribute to but do not uniquely cause. Keeping that distinction clean makes the research angle defensible.

## Files

| File | Role |
|---|---|
| [`grid_history.sql`](./grid_history.sql) | SQLite DDL + research views |
| [`types.js`](./types.js) | Shared field enums / helpers for the companion site + future Pi logger |
| [`example_reading.json`](./example_reading.json) | One sample pull + one sample spike |

## Init on device

```bash
sqlite3 ~/sprout/grid_history.db < sprout/schema/grid_history.sql
```
