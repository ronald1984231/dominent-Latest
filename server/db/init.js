require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🔍 Initializing database...');
  
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please set DATABASE_URL in your .env file with your Neon database connection string');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: databaseUrl.includes('neon.tech') ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    // Test connection
    console.log('📊 Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');

    // Read and execute the SQL schema
    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, 'init.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🏗️  Creating database schema...');
    await pool.query(schema);
    console.log('✅ Database schema created successfully');

    // Check if we have any domains
    const result = await pool.query('SELECT COUNT(*) as count FROM domains');
    const domainCount = parseInt(result.rows[0].count);
    console.log(`📊 Total domains in database: ${domainCount}`);

    if (domainCount === 0) {
      console.log('ℹ️  No domains found. Sample domains have been added.');
    } else {
      console.log('✅ Database already has domain data');
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔚 Database connection closed');
  }

  console.log('🎉 Database initialization complete!');
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

module.exports = { initializeDatabase };
