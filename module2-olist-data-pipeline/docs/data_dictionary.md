# Data Dictionary — Olist E-Commerce Dataset

## Overview

This document summarises the raw Olist dataset tables used in the Module 2 data engineering assignment. It records each table's purpose, row count, column count, key columns, and notes required for later warehouse design.

---

## Raw Dataset Summary

| Table | Rows | Columns | Description |
|---|---:|---:|---|
| orders | 99,441 | 8 | Contains order-level information including customer, order status, and order timestamps. |
| order_items | 112,650 | 7 | Contains item-level order details such as product, seller, price, and freight value. |
| customers | 99,441 | 5 | Contains customer identifiers and customer location details. |
| products | 32,951 | 9 | Contains product details such as category, dimensions, weight, and description metadata. |
| sellers | 3,095 | 4 | Contains seller identifiers and seller location details. |
| payments | 103,886 | 5 | Contains payment information for each order, including payment type, instalments, and payment value. |
| reviews | 99,224 | 7 | Contains customer review scores and review timestamps. |
| geolocation | 1,000,163 | 5 | Contains zip-code-level geolocation data. |
| translation | 71 | 2 | Translates Portuguese product category names into English. |

---

## Table Details

### 1. orders

**Purpose:**  
Stores order-level transaction information.

**Expected key column:**  
- `order_id`

**Important columns:**  
- `order_id`
- `customer_id`
- `order_status`
- `order_purchase_timestamp`
- `order_approved_at`
- `order_delivered_carrier_date`
- `order_delivered_customer_date`
- `order_estimated_delivery_date`

**Relationship notes:**  
- Links to `customers` using `customer_id`.
- Links to `order_items`, `payments`, and `reviews` using `order_id`.

---

### 2. order_items

**Purpose:**  
Stores product-level details for each order.

**Expected key column:**  
- Composite key: `order_id` + `order_item_id`

**Important columns:**  
- `order_id`
- `order_item_id`
- `product_id`
- `seller_id`
- `shipping_limit_date`
- `price`
- `freight_value`

**Relationship notes:**  
- Links to `orders` using `order_id`.
- Links to `products` using `product_id`.
- Links to `sellers` using `seller_id`.

---

### 3. customers

**Purpose:**  
Stores customer identity and location information.

**Expected key column:**  
- `customer_id`

**Important columns:**  
- `customer_id`
- `customer_unique_id`
- `customer_zip_code_prefix`
- `customer_city`
- `customer_state`

**Relationship notes:**  
- Links to `orders` using `customer_id`.

---

### 4. products

**Purpose:**  
Stores product category and product attribute information.

**Expected key column:**  
- `product_id`

**Important columns:**  
- `product_id`
- `product_category_name`
- `product_name_lenght`
- `product_description_lenght`
- `product_photos_qty`
- `product_weight_g`
- `product_length_cm`
- `product_height_cm`
- `product_width_cm`

**Relationship notes:**  
- Links to `order_items` using `product_id`.
- Links to `translation` using `product_category_name`.

---

### 5. sellers

**Purpose:**  
Stores seller identity and location information.

**Expected key column:**  
- `seller_id`

**Important columns:**  
- `seller_id`
- `seller_zip_code_prefix`
- `seller_city`
- `seller_state`

**Relationship notes:**  
- Links to `order_items` using `seller_id`.

---

### 6. payments

**Purpose:**  
Stores order payment information.

**Expected key column:**  
- Composite key: `order_id` + `payment_sequential`

**Important columns:**  
- `order_id`
- `payment_sequential`
- `payment_type`
- `payment_installments`
- `payment_value`

**Relationship notes:**  
- Links to `orders` using `order_id`.
- One order may have more than one payment record.

---

### 7. reviews

**Purpose:**  
Stores customer review information.

**Expected key column:**  
- `review_id`

**Important columns:**  
- `review_id`
- `order_id`
- `review_score`
- `review_comment_title`
- `review_comment_message`
- `review_creation_date`
- `review_answer_timestamp`

**Relationship notes:**  
- Links to `orders` using `order_id`.

---

### 8. geolocation

**Purpose:**  
Stores zip-code-level location coordinates.

**Expected key column:**  
- No single unique key confirmed at this stage.

**Important columns:**  
- `geolocation_zip_code_prefix`
- `geolocation_lat`
- `geolocation_lng`
- `geolocation_city`
- `geolocation_state`

**Relationship notes:**  
- Can be linked to customers or sellers using zip code prefix.
- May require aggregation because one zip code may appear multiple times.

---

### 9. translation

**Purpose:**  
Stores English translations for product category names.

**Expected key column:**  
- `product_category_name`

**Important columns:**  
- `product_category_name`
- `product_category_name_english`

**Relationship notes:**  
- Links to `products` using `product_category_name`.

---

---

## Staging Layer Column Mapping (olist_dev_staging)

Staging views rename columns for consistency and cast data types. No rows are removed.

| Raw column | Staging column | Type change | Table |
|---|---|---|---|
| `order_purchase_timestamp` | `purchase_at` | STRING → TIMESTAMP | stg_orders |
| `order_approved_at` | `approved_at` | STRING → TIMESTAMP | stg_orders |
| `order_delivered_carrier_date` | `delivered_carrier_at` | STRING → TIMESTAMP | stg_orders |
| `order_delivered_customer_date` | `delivered_customer_at` | STRING → TIMESTAMP | stg_orders |
| `order_estimated_delivery_date` | `estimated_delivery_at` | STRING → TIMESTAMP | stg_orders |
| `customer_zip_code_prefix` | `zip_code_prefix` | INT → STRING | stg_customers |
| `customer_city` | `city` | — | stg_customers |
| `customer_state` | `state` | — | stg_customers |
| `shipping_limit_date` | `shipping_limit_at` | STRING → TIMESTAMP | stg_order_items |
| `price` | `price` | STRING → FLOAT64 | stg_order_items |
| `freight_value` | `freight_value` | STRING → FLOAT64 | stg_order_items |
| `payment_value` | `payment_value` | STRING → FLOAT64 | stg_order_payments |
| `review_score` | `review_score` | STRING → INT64 | stg_order_reviews |
| `review_comment_title` | `review_comment_title` | empty string → NULL | stg_order_reviews |
| `review_comment_message` | `review_comment_message` | empty string → NULL | stg_order_reviews |
| `review_creation_date` | `review_created_at` | STRING → TIMESTAMP | stg_order_reviews |
| `review_answer_timestamp` | `review_answered_at` | STRING → TIMESTAMP | stg_order_reviews |
| `product_name_lenght` | `name_length` | STRING → INT64 | stg_products |
| `product_description_lenght` | `description_length` | STRING → INT64 | stg_products |
| `product_photos_qty` | `photos_qty` | STRING → INT64 | stg_products |
| `product_weight_g` | `weight_g` | STRING → INT64 | stg_products |
| `product_length_cm` | `length_cm` | STRING → INT64 | stg_products |
| `product_height_cm` | `height_cm` | STRING → INT64 | stg_products |
| `product_width_cm` | `width_cm` | STRING → INT64 | stg_products |
| `seller_zip_code_prefix` | `zip_code_prefix` | INT → STRING | stg_sellers |
| `seller_city` | `city` | — | stg_sellers |
| `seller_state` | `state` | — | stg_sellers |
| `geolocation_zip_code_prefix` | `zip_code_prefix` | INT → STRING | stg_geolocation |
| `geolocation_lat` | `lat` | STRING → FLOAT64 | stg_geolocation |
| `geolocation_lng` | `lng` | STRING → FLOAT64 | stg_geolocation |
| `geolocation_city` | `city` | — | stg_geolocation |
| `geolocation_state` | `state` | — | stg_geolocation |
| `product_category_name_english` | `category_name_english` | — | stg_category_name_translation |

---

## Initial Relationship Map

```text
customers
   ↓ customer_id
orders
   ↓ order_id
order_items
   ├── product_id → products → translation
   └── seller_id  → sellers

orders → payments
orders → reviews

customers / sellers → geolocation through zip code prefix