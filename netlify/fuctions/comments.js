const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  try {
    const postId = event.path.split('/').pop();
    
    if (event.httpMethod === 'GET') {
      // Get comments for a post
      const result = await pool.query(
        'SELECT * FROM comments WHERE post_id = $1 ORDER BY timestamp ASC',
        [postId]
      );
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows)
      };
    } else if (event.httpMethod === 'POST') {
      // Add a comment to a post
      const { content } = JSON.parse(event.body);
      const result = await pool.query(
        'INSERT INTO comments (post_id, content) VALUES ($1, $2) RETURNING *',
        [postId, content]
      );
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows[0])
      };
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }

};
