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
  )`
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
  const tableName = currentMigration === 0 ? 'products' : 'product_variants';
  
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