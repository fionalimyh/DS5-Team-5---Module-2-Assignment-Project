# Schema Design — Olist Star Schema

**BigQuery dataset:** `our-project-93971.olist_dev_star`
**Built with:** dbt `our_project`

---

## Star Schema Diagram

```
                    dim_dates
                    (date_id PK)
                        │ purchase_date FK
                        │
dim_customers ──────────┼──────── fact_order_items ──────── dim_products
(customer_id PK)   customer_id FK  (order_id + order_item_id PK)  (product_id PK)
                                        │ seller_id FK
                                        │
                                   dim_sellers
                                   (seller_id PK)

fact_orders
(order_id PK)
  ├── customer_id FK → dim_customers
  └── purchase_date FK → dim_dates
```

---

## Fact Tables

### fact_order_items

**Grain:** One row per order line item (order_id + order_item_id).
**Dataset:** `olist_dev_star`
**Purpose:** Core revenue table. Use this to analyse sales by product, seller, customer, or time period.

| Column | Type | Description |
|---|---|---|
| `order_id` | STRING | FK → fact_orders |
| `order_item_id` | INT64 | Line number within order |
| `product_id` | STRING | FK → dim_products |
| `seller_id` | STRING | FK → dim_sellers |
| `customer_id` | STRING | FK → dim_customers |
| `purchase_date` | DATE | FK → dim_dates |
| `price` | FLOAT64 | Base product price |
| `freight_value` | FLOAT64 | Shipping cost |
| `total_item_cost` | FLOAT64 | price + freight_value |

**Row count:** ~112,650 (clean records only)

---

### fact_orders

**Grain:** One row per order.
**Dataset:** `olist_dev_star`
**Purpose:** Order fulfilment analysis — delivery performance, review scores, payment totals.

| Column | Type | Description |
|---|---|---|
| `order_id` | STRING | PK |
| `customer_id` | STRING | FK → dim_customers |
| `order_status` | STRING | delivered / shipped / canceled etc. |
| `purchase_date` | DATE | FK → dim_dates |
| `delivery_days` | INT64 | Days from purchase to customer delivery |
| `estimated_delivery_days` | INT64 | Days from purchase to estimated delivery |
| `review_score` | INT64 | 1–5, NULL if no review |
| `total_payment_value` | FLOAT64 | Sum of all payments for the order |

**Row count:** ~99,400 (clean records only)

---

## Dimension Tables

### dim_customers

**Grain:** One row per customer_id.

| Column | Type | Description |
|---|---|---|
| `customer_id` | STRING | PK |
| `customer_unique_id` | STRING | Unique customer identity across multiple orders |
| `city` | STRING | Customer city |
| `state` | STRING | Customer state (2-letter code) |
| `zip_code_prefix` | STRING | 5-digit zip code prefix |

**Row count:** ~99,441

---

### dim_products

**Grain:** One row per product_id. English category name joined from `stg_category_name_translation`.

| Column | Type | Description |
|---|---|---|
| `product_id` | STRING | PK |
| `category_name` | STRING | Portuguese category name |
| `category_name_english` | STRING | English category name (`unknown` if no translation) |
| `name_length` | INT64 | Character count of product name |
| `description_length` | INT64 | Character count of product description |
| `photos_qty` | INT64 | Number of product photos |
| `weight_g` | INT64 | Product weight in grams |

**Row count:** ~32,340 (611 products with null category excluded)

---

### dim_sellers

**Grain:** One row per seller_id.

| Column | Type | Description |
|---|---|---|
| `seller_id` | STRING | PK |
| `city` | STRING | Seller city |
| `state` | STRING | Seller state (2-letter code) |
| `zip_code_prefix` | STRING | 5-digit zip code prefix |

**Row count:** ~3,095

---

### dim_dates

**Grain:** One row per calendar date. Generated — not from a source table.
**Range:** 2016-01-01 to 2018-12-31 (covers the full Olist dataset period).

| Column | Type | Description |
|---|---|---|
| `date_id` | DATE | PK |
| `year` | INT64 | e.g. 2017 |
| `month` | INT64 | 1–12 |
| `month_name` | STRING | e.g. January |
| `quarter` | INT64 | 1–4 |
| `day_of_week` | STRING | e.g. Monday |
| `is_weekend` | BOOLEAN | TRUE for Saturday and Sunday |

**Row count:** 1,096

---

## Common Analysis Queries

**Total revenue by product category:**
```sql
SELECT
    p.category_name_english,
    SUM(f.total_item_cost) AS total_revenue
FROM `our-project-93971.olist_dev_star.fact_order_items` f
JOIN `our-project-93971.olist_dev_star.dim_products` p
    ON f.product_id = p.product_id
GROUP BY p.category_name_english
ORDER BY total_revenue DESC;
```

**Average delivery days by state:**
```sql
SELECT
    c.state,
    ROUND(AVG(o.delivery_days), 1) AS avg_delivery_days
FROM `our-project-93971.olist_dev_star.fact_orders` o
JOIN `our-project-93971.olist_dev_star.dim_customers` c
    ON o.customer_id = c.customer_id
WHERE o.delivery_days IS NOT NULL
GROUP BY c.state
ORDER BY avg_delivery_days;
```

**Monthly order count and revenue:**
```sql
SELECT
    d.year,
    d.month_name,
    COUNT(DISTINCT f.order_id) AS order_count,
    SUM(f.total_item_cost)     AS total_revenue
FROM `our-project-93971.olist_dev_star.fact_order_items` f
JOIN `our-project-93971.olist_dev_star.dim_dates` d
    ON f.purchase_date = d.date_id
GROUP BY d.year, d.month_name, d.month
ORDER BY d.year, d.month;
```
