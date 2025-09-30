const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    // Extract postId from path
    const pathParts = event.path.split('/');
    const postId = pathParts[pathParts.length - 1];
    const { reactionType } = JSON.parse(event.body);
    
    // Get current reactions
    const postResult = await pool.query('SELECT reactions FROM posts WHERE id = $1', [postId]);
    
    if (postResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Post not found' })
      };
    }
    
    let reactions = postResult.rows[0].reactions;
    if (typeof reactions === 'string') {
      reactions = JSON.parse(reactions);
    }
    
    reactions[reactionType] = (reactions[reactionType] || 0) + 1;
    
    await pool.query('UPDATE posts SET reactions = $1 WHERE id = $2', [JSON.stringify(reactions), postId]);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, reactions })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
