SELECT
    product_category_name,
    product_category_name_english AS category_name_english
FROM {{ source('kaggle_data', 'category_name_translation') }}
