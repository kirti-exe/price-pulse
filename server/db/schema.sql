DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS watchlist;
DROP TABLE IF EXISTS users;

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    image TEXT
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

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE watchlist (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);