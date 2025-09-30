const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // Extract postId from path
    const pathParts = event.path.split('/');
    const postId = pathParts[pathParts.length - 1];
    
    if (event.httpMethod === 'GET') {
      const result = await pool.query(
        'SELECT * FROM comments WHERE post_id = $1 ORDER BY timestamp ASC',
        [postId]
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.rows)
      };
    } else if (event.httpMethod === 'POST') {
      const { content } = JSON.parse(event.body);
      const result = await pool.query(
        'INSERT INTO comments (post_id, content) VALUES ($1, $2) RETURNING *',
        [postId, content]
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
