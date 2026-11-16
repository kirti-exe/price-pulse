DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE stores(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_id INT NOT NULL REFERENCES stores(id),
    price INT NOT NULL,
    original_price INT NOT NULL,
    UNIQUE (product_id, store_id) 
);

CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    price INT NOT NULL,
    recorded_at DATE NOT NULL
);