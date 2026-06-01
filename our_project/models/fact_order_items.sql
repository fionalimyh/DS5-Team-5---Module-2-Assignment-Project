
SELECT
    order_id,
    order_item_id,
    product_id,
    seller_id,
    shipping_limit_date,
    price,
    freight_value,
    (price + freight_value) AS total_item_cost
FROM {{ source('kaggle_data', 'order_items') }}