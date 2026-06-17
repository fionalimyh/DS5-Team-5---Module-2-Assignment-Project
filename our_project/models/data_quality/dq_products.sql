WITH flagged AS (
    SELECT
        product_id,
        (product_id IS NULL)                              AS null_product_id,
        (product_category_name IS NULL)                   AS null_category_name,
        (weight_g IS NOT NULL AND weight_g < 0)           AS negative_weight
    FROM {{ ref('stg_products') }}
)
SELECT
    product_id,
    null_product_id,
    null_category_name,
    negative_weight,
    (
        SELECT STRING_AGG(issue, ', ' ORDER BY issue)
        FROM UNNEST([
            IF(null_product_id,    'null_product_id', NULL),
            IF(null_category_name, 'null_category_name', NULL),
            IF(negative_weight,    'negative_weight', NULL)
        ]) AS issue
        WHERE issue IS NOT NULL
    ) AS issues
FROM flagged
WHERE null_product_id
   OR null_category_name
   OR negative_weight
