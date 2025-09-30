const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  try {
    // Test basic connection
    const result = await pool.query('SELECT NOW()');
    
    // Test if tables exist
    let tablesExist = false;
    try {
      await pool.query('SELECT * FROM posts LIMIT 1');
      tablesExist = true;
    } catch (e) {
      // Table doesn't exist or other error
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Database connection successful!',
        time: result.rows[0].now,
        tablesExist
      })
    };
  } catch (error) {
    console.error('Database connection error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Database connection failed',
        message: error.message 
      })
    };
  }
};