-- migrations/create_products_tables.sql

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  series VARCHAR(255),
  code VARCHAR(100),
  main_image_url VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE
);

CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size VARCHAR(50),
  color VARCHAR(100),
  image_url VARCHAR(500),
  price DECIMAL(10,2) DEFAULT 0,
  stock INT DEFAULT 0,
  in_stock BOOLEAN AS (stock > 0) VIRTUAL, -- MySQL generated column (or compute in queries)
  sku VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
