# DS5 Team 5 — Module 2 Assignment Project
## Olist E-Commerce Data Warehouse and Analytics Pipeline

---

## 1. Project Overview

This project builds an end-to-end ELT data pipeline for the Olist Brazilian E-Commerce dataset. Raw CSV files are imported into Supabase (PostgreSQL), extracted by Meltano and loaded into GCP BigQuery, transformed through three dbt layers (staging → data quality → star schema), and analysed in Jupyter notebooks.

**Status:** Pipeline complete — 24 dbt models built, 53 tests passing.

---

## 2. Business Problem

Raw e-commerce data is spread across multiple operational files (orders, customers, products, sellers, payments, reviews). This makes it difficult for business teams to answer questions consistently.

This project creates a structured data warehouse to support analysis on:
- Monthly sales trends and revenue
- Top-selling product categories
- Customer purchasing behaviour
- Seller performance
- Delivery performance vs estimates
- Review score patterns

---

## 3. Architecture

```
Kaggle CSVs (9 files)
    ↓ import via Supabase UI / CSV upload
Supabase PostgreSQL (public.sb_* tables)
    ↓ Meltano  tap-postgres → target-bigquery
BigQuery: our-project-93971.Supabase_data (public_sb_* tables)
    ↓ dbt run
olist_dev_staging     (views)             ← Layer 1: rename, cast, standardise
    ↓                      ↓
olist_dev_data_quality     olist_dev_star ← Layer 2: flag issues | Layer 3: clean star schema
(tables)                   (tables)
    ↓
Analysis — Jupyter notebooks / BigQuery
```

See [`docs/architecture.md`](docs/architecture.md) for the full design.

---

## 4. Dataset

**Source:** Brazilian E-Commerce Public Dataset by Olist (Kaggle)
**Loaded into:** Supabase PostgreSQL → `our-project-93971.Supabase_data` (BigQuery via Meltano)

| BigQuery table (Supabase_data) | Rows |
|---|---:|
| public_sb_orders_dataset | 99,441 |
| public_sb_customers_dataset | 99,441 |
| public_sb_order_items_dataset | 112,650 |
| public_sb_order_payments_dataset | 103,886 |
| public_sb_order_reviews_dataset | 99,224 |
| public_sb_products_dataset | 32,951 |
| public_sb_sellers_dataset | 3,095 |
| public_sb_geolocation_dataset | 1,000,163 |
| public_sb_product_category_name_translation | 71 |

All 9 tables loaded from Supabase via Meltano (tap-postgres → target-bigquery).

---

## 5. dbt Pipeline

**Project:** `our_project`
**Profile:** `our_project` → BigQuery (`our-project-93971`), oauth, location: US
**Source dataset:** `Supabase_data` (tables populated by Meltano)

### Layer 1 — Staging (`olist_dev_staging`)
9 views. One per source table. Reads from `Supabase_data.public_sb_*`, renames columns, casts data types, standardises nulls. No rows removed.

| Model | Key changes |
|---|---|
| `stg_orders` | 5 timestamp columns cast to TIMESTAMP |
| `stg_customers` | zip_code_prefix standardised to STRING |
| `stg_order_items` | price, freight_value cast to FLOAT64 |
| `stg_order_payments` | payment_value cast to FLOAT64 |
| `stg_order_reviews` | dates cast, empty comments → NULL |
| `stg_products` | dimensions cast to INT64, typos fixed in column names |
| `stg_sellers` | zip_code_prefix standardised to STRING |
| `stg_geolocation` | lat/lng cast to FLOAT64 |
| `stg_category_name_translation` | English name column renamed |

### Layer 2 — Data Quality (`olist_dev_data_quality`)
9 tables. Stores only flagged rows. Empty table = clean data.

| Model | Flagged rows | Main issues |
|---|---:|---|
| `dq_orders` | 0 | Clean ✅ |
| `dq_customers` | 0 | Clean ✅ |
| `dq_order_items` | 0 | Clean ✅ |
| `dq_order_payments` | 9 | Zero/negative payment values |
| `dq_order_reviews` | 0 | Clean ✅ |
| `dq_products` | 611 | 609 missing category name, 2 missing dimensions |
| `dq_sellers` | 0 | Clean ✅ |
| `dq_geolocation` | 42 | Coordinates outside Brazil bounds |
| `dq_category_name_translation` | 0 | Clean ✅ |

See [`docs/data_quality_report.md`](docs/data_quality_report.md) for full details.

### Layer 3 — Star Schema (`olist_dev_star`)
6 tables. Clean records only — DQ-flagged rows excluded.

| Model | Rows | Description |
|---|---:|---|
| `fact_order_items` | 112,650 | Revenue fact — one row per order line item |
| `fact_orders` | 99,400 | Order fact — delivery times, review score, payment total |
| `dim_customers` | 99,441 | Customer dimension |
| `dim_products` | 32,340 | Product dimension with English category names |
| `dim_sellers` | 3,095 | Seller dimension |
| `dim_dates` | 1,096 | Generated date spine (2016–2018) |

See [`docs/schema_design.md`](docs/schema_design.md) for column definitions and sample queries.

---

## 6. Running the Pipeline

**Prerequisites:** conda env `elt` with dbt-bigquery, GCP credentials via `gcloud auth application-default login`.

### Step 1 — Load CSVs into Supabase
Import the 9 Olist CSV files into Supabase PostgreSQL as `public.sb_*` tables via the Supabase dashboard (Table Editor → Import CSV).

### Step 2 — Extract from Supabase and load into BigQuery (Meltano)

```bash
cd meltano-supabase

# Set Supabase password, then run the ELT job
export TAP_POSTGRES_PASSWORD=<supabase_password>
meltano run tap-postgres target-bigquery
```

Loads all 9 tables into `our-project-93971.Supabase_data` as `public_sb_*`.

### Step 3 — Transform with dbt

```bash
cd our_project

# Verify connection
/home/fionalyh/miniconda3/envs/elt/bin/dbt debug

# Build all models (staging → data_quality → star)
/home/fionalyh/miniconda3/envs/elt/bin/dbt run

# Run all tests
/home/fionalyh/miniconda3/envs/elt/bin/dbt test
```

Expected: `24 of 24 OK` on run, `53 of 53 PASS` on test.

---

## 7. Project Structure

```
DS5-Team-5---Module-2-Assignment-Project/
├── Data from Kaggle/                 ← Source CSVs (9 files)
├── module2-olist-data-pipeline/
│   ├── docs/
│   │   ├── architecture.md           ← Pipeline design and layer details
│   │   ├── data_dictionary.md        ← Column definitions and staging mapping
│   │   ├── data_quality_report.md    ← DQ findings with actual row counts
│   │   └── schema_design.md          ← Star schema with sample queries
│   ├── notebooks/
│   │   ├── 01_data_understanding.ipynb   ← EDA + staging/DQ explanation
│   │   └── 02_star_schema_analysis.ipynb ← Star schema queries and analysis
│   ├── requirements.txt
│   └── README.md
├── our_project/                      ← dbt project root
│   ├── dbt_project.yml
│   ├── profiles.yml
│   ├── models/
│   │   ├── sources.yml               ← All 9 BigQuery source tables declared
│   │   ├── staging/                  ← 9 stg_* view models + schema.yml
│   │   ├── data_quality/             ← 9 dq_* table models + schema.yml
│   │   └── star/                     ← 2 fact + 4 dim table models + schema.yml
│   └── target/                       ← dbt compiled artefacts (not committed)
└── meltano-supabase/                 ← Meltano ELT project (tap-postgres → BigQuery)
    ├── meltano.yml
    └── plugins/
```

---

## 8. Documentation

| File | Contents |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | Full pipeline architecture, dbt config, layer-by-layer design |
| [`docs/data_dictionary.md`](docs/data_dictionary.md) | Raw table summaries, staging column mapping |
| [`docs/data_quality_report.md`](docs/data_quality_report.md) | DQ check results, flagged row counts, how to query issues |
| [`docs/schema_design.md`](docs/schema_design.md) | Star schema diagram, column types, common analysis queries |
