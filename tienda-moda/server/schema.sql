-- AD Moda & Confort — esquema. server/migrate.js ejecuta este archivo (DROP + CREATE) y luego siembra datos.

DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text UNIQUE NOT NULL,
  password   text NOT NULL,
  role       text NOT NULL DEFAULT 'customer',
  phone      text NOT NULL DEFAULT '',
  address    text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id           text PRIMARY KEY,
  name         text NOT NULL,
  brand        text NOT NULL DEFAULT '',
  category     text NOT NULL DEFAULT '',
  price        integer NOT NULL DEFAULT 0,
  availability text NOT NULL DEFAULT 'stock',
  sizes        jsonb NOT NULL DEFAULT '[]'::jsonb,
  stock        jsonb NOT NULL DEFAULT '{}'::jsonb,
  image        text NOT NULL DEFAULT '',
  description  text NOT NULL DEFAULT '',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE orders (
  id                 text PRIMARY KEY,
  user_id            uuid REFERENCES users(id) ON DELETE SET NULL,
  status             text NOT NULL DEFAULT 'reservado',
  fulfillment        text NOT NULL DEFAULT 'pickup',
  customer           jsonb NOT NULL DEFAULT '{}'::jsonb,
  items              jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal           integer NOT NULL DEFAULT 0,
  estimated_ready_at timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
