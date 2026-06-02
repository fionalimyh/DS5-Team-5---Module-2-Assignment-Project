SELECT
    customer_id,
    customer_unique_id,
    CAST(customer_zip_code_prefix AS STRING) AS zip_code_prefix,
    customer_city                            AS city,
    customer_state                           AS state
FROM {{ source('kaggle_data', 'customers') }}
