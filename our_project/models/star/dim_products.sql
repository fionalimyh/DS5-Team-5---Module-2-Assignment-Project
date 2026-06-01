
/*
    Welcome to your first dbt model!
    Did you know that you can also configure models directly within SQL files?
    This will override configurations stated in dbt_project.yml

    Try changing "table" to "view" below
*/

SELECT
    product_id,
    -- Handling potential missing categories cleanly for our test
    COALESCE(product_category_name, 'unknown') AS product_category_name,
    product_name_lenght,
    product_description_lenght,
    product_photos_qty
FROM {{ source('kaggle_data', 'products') }}

/*
    Uncomment the line below to remove records with null `id` values
*/

-- where id is not null
