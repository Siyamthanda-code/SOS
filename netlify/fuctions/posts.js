const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === 'GET') {
      // Get all posts
      const result = await pool.query('SELECT * FROM posts ORDER BY timestamp DESC');
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.rows)
      };
    } else if (event.httpMethod === 'POST') {
      // Create a new post
      const { topic, content, hasWarning } = JSON.parse(event.body);
      const result = await pool.query(
        'INSERT INTO posts (topic, content, has_warning) VALUES ($1, $2, $3) RETURNING *',
        [topic, content, hasWarning]
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
