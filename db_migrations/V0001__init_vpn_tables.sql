CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  auto_renew BOOLEAN DEFAULT TRUE,
  price INTEGER NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  yoomoney_label VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS server_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  server_city VARCHAR(100) NOT NULL,
  server_flag VARCHAR(10),
  vless_key TEXT NOT NULL,
  ping INTEGER DEFAULT 0,
  load_percent INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS traffic_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  bytes_used BIGINT DEFAULT 0,
  bytes_limit BIGINT DEFAULT 0,
  server_city VARCHAR(100),
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'paid',
  yoomoney_label VARCHAR(100),
  paid_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  ip_address VARCHAR(45),
  user_agent TEXT,
  success BOOLEAN DEFAULT TRUE,
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_server_keys_user ON server_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_traffic_user ON traffic_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_user ON login_logs(user_id);
