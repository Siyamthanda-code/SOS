const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    if (event.httpMethod === 'GET') {
      const result = await pool.query('SELECT * FROM posts ORDER BY timestamp DESC');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    } else if (event.httpMethod === 'POST') {
      const { topic, content, hasWarning } = JSON.parse(event.body);
      const result = await pool.query(
        'INSERT INTO posts (topic, content, has_warning, reactions) VALUES ($1, $2, $3, $4) RETURNING *',
        [topic, content, hasWarning, JSON.stringify({ support: 0, strength: 0, hope: 0 })]
      );
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(result.rows[0])
      };
    }
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
