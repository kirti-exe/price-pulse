DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS alerts;

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
    ALTER TABLE listings ADD COLUMN external_id TEXT;
    ALTER TABLE listings ADD COLUMN url TEXT;
    UNIQUE (product_id, store_id) 
);

CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    price INT NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERNCES products(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    target_price INT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notified_at TIMESTAMPTZ
);