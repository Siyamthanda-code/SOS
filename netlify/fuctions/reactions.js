const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

exports.handler = async (event, context) => {
  try {
    const postId = event.path.split('/').pop();
    const { reactionType } = JSON.parse(event.body);
    
    // Get current reactions
    const postResult = await pool.query('SELECT reactions FROM posts WHERE id = $1', [postId]);
    const reactions = postResult.rows[0].reactions;
    
    // Update the reaction count
    reactions[reactionType] = (reactions[reactionType] || 0) + 1;
    
    // Save back to database
    await pool.query('UPDATE posts SET reactions = $1 WHERE id = $2', [reactions, postId]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, reactions })
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }

};
