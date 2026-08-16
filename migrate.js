require('dotenv').config();
const db = require('./config/db');

const migrations = [
  // Create products table
  `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    main_image_url VARCHAR(500),
    description TEXT,
    category VARCHAR(100) DEFAULT 'tiles',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Create product_variants table
  `CREATE TABLE IF NOT EXISTS product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    series VARCHAR(255),
    code VARCHAR(255),
    size VARCHAR(100),
    pcs_per_ctn INT DEFAULT 0,
    m2_per_ctn DECIMAL(10,2) DEFAULT 0,
    kg_per_ctn DECIMAL(10,2) DEFAULT 0,
    image_url VARCHAR(500),
    stock INT DEFAULT 0,
    tile_type ENUM('slide', 'non-slide') DEFAULT 'non-slide',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  status ENUM('active', 'submitted', 'abandoned')
    DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
)`, 

`CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (cart_id)
    REFERENCES carts(id)
    ON DELETE CASCADE,

  FOREIGN KEY (product_id)
    REFERENCES products(id)
    ON DELETE CASCADE,

  FOREIGN KEY (variant_id)
    REFERENCES product_variants(id)
    ON DELETE CASCADE,

  UNIQUE KEY unique_cart_variant (
    cart_id,
    variant_id
  )
)`,
// Create orders table
`
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,

  order_number VARCHAR(50) NOT NULL UNIQUE,

  cart_id INT NOT NULL,

  session_id VARCHAR(100) NOT NULL,

  customer_name VARCHAR(255) NOT NULL,

  phone VARCHAR(50) NOT NULL,

  email VARCHAR(255),

  delivery_location VARCHAR(500) NOT NULL,

  notes TEXT,

  status ENUM(
    'pending',
    'confirmed',
    'processing',
    'completed',
    'cancelled'
  ) DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (cart_id)
    REFERENCES carts(id)
    ON DELETE RESTRICT
)
`,

// Create order_items table
`
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,

  order_id INT NOT NULL,

  product_id INT NOT NULL,

  variant_id INT NOT NULL,

  product_name VARCHAR(255) NOT NULL,

  brand VARCHAR(255),

  series VARCHAR(255),

  code VARCHAR(255),

  size VARCHAR(100),

  pcs_per_ctn INT DEFAULT 0,

  m2_per_ctn DECIMAL(10,2) DEFAULT 0,

  kg_per_ctn DECIMAL(10,2) DEFAULT 0,

  tile_type VARCHAR(50),

  quantity INT NOT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id)
    REFERENCES orders(id)
    ON DELETE CASCADE
)
`
];

// Run migrations one by one
let currentMigration = 0;

function runNextMigration() {
  if (currentMigration >= migrations.length) {
    // All migrations completed, show tables
    db.query('SHOW TABLES', (err, tables) => {
      if (err) {
        console.error('❌ Error checking tables:', err.message);
      } else {
        console.log('📊 Available tables:');
        tables.forEach(table => {
          console.log('   -', table[Object.keys(table)[0]]);
        });
      }
      process.exit(0);
    });
    return;
  }

  const sql = migrations[currentMigration];
  const tableNames = [ 'products', 'product_variants', 'carts', 'carts_items', 'orders', 'order_items'];
  const tableName = tableNames[currentMigration]
  
  console.log(`🔄 Creating ${tableName} table...`);
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error(`❌ Failed to create ${tableName} table:`, err.message);
      process.exit(1);
    } else {
      console.log(`✅ ${tableName} table created successfully!`);
      currentMigration++;
      runNextMigration();
    }
  });
}

// Start migrations
console.log('🚀 Starting database migrations...');
runNextMigration();