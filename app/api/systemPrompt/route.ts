import { Pool } from 'pg';

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:2TYvAzNlt0Oy@ep-noisy-shape-a5hfgfjr.us-east-2.aws.neon.tech/documents?sslmode=require",
});

// Initialize the table if it doesn't exist
async function initializeTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "Midyear Changes 302 - Workplace Sim: QLE Consistency Rule" (
      id SERIAL PRIMARY KEY,
      prompt TEXT NOT NULL,
      heading TEXT DEFAULT '👋 Hi There!',
      description TEXT DEFAULT '',
      page_title TEXT DEFAULT 'Teach Back : Testing agent',
      about_exercise TEXT DEFAULT 'In this practice session, you will practice having a conversation with your manager about all of the essential questions in the 101 course.',
      your_task TEXT DEFAULT 'In this practice session, You will take on the role of a pharmacy benefits consultant, explaining how drug pricing methodologies impact pharmaceutical costs and reimbursement. Your goal is to:',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(createTableQuery);
    // Insert default values if table is empty
    const checkEmpty = await pool.query('SELECT COUNT(*) FROM "Midyear Changes 302 - Workplace Sim: QLE Consistency Rule"');
    if (checkEmpty.rows[0].count === '0') {
      await pool.query(
        'INSERT INTO "Midyear Changes 302 - Workplace Sim: QLE Consistency Rule" (prompt, heading, description, about_exercise, your_task) VALUES ($1, $2, $3, $4, $5)', 
        ['', '👋 Hi There!', 'Welcome to the chat interface. Please click Begin to start.', 'In this practice session, you will practice having a conversation with your manager about all of the essential questions in the 101 course.', 'In this practice session, You will take on the role of a pharmacy benefits consultant, explaining how drug pricing methodologies impact pharmaceutical costs and reimbursement. Your goal is to:']
      );
    }
  } catch (error) {
    console.error('Error initializing table:', error);
  }
}

// Initialize table when module loads
initializeTable();

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT prompt, heading, description, page_title, about_exercise, your_task FROM "Midyear Changes 302 - Workplace Sim: QLE Consistency Rule" ORDER BY updated_at DESC LIMIT 1'
    );
    return new Response(JSON.stringify({
      prompt: result.rows[0]?.prompt || '',
      heading: result.rows[0]?.heading || '👋 Hi There!',
      description: result.rows[0]?.description || 'Welcome to the chat interface. Please click Begin to start.',
      pageTitle: result.rows[0]?.page_title || 'Teach Back : Testing agent',
      aboutExercise: result.rows[0]?.about_exercise || 'In this practice session, you will practice having a conversation with your manager about all of the essential questions in the 101 course.',
      yourTask: result.rows[0]?.your_task || 'In this practice session, You will take on the role of a pharmacy benefits consultant, explaining how drug pricing methodologies impact pharmaceutical costs and reimbursement. Your goal is to:'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching prompt:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch prompt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const { prompt, heading, description, pageTitle, aboutExercise, yourTask } = await request.json();
    
    // Build dynamic update query based on provided fields
    let updateFields = [];
    let values = [];
    let paramCount = 1;
    
    if (prompt !== undefined) {
      updateFields.push(`prompt = $${paramCount}`);
      values.push(prompt);
      paramCount++;
    }
    if (heading !== undefined) {
      updateFields.push(`heading = $${paramCount}`);
      values.push(heading);
      paramCount++;
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }
    if (pageTitle !== undefined) {
      updateFields.push(`page_title = $${paramCount}`);
      values.push(pageTitle);
      paramCount++;
    }
    if (aboutExercise !== undefined) {
      updateFields.push(`about_exercise = $${paramCount}`);
      values.push(aboutExercise);
      paramCount++;
    }
    if (yourTask !== undefined) {
      updateFields.push(`your_task = $${paramCount}`);
      values.push(yourTask);
      paramCount++;
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const updateQuery = `
      UPDATE "Midyear Changes 302 - Workplace Sim: QLE Consistency Rule" 
      SET ${updateFields.join(', ')}
      WHERE id = (SELECT id FROM "Midyear Changes 302 - Workplace Sim: QLE Consistency Rule" ORDER BY updated_at DESC LIMIT 1)
    `;
    
    await pool.query(updateQuery, values);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return new Response(JSON.stringify({ error: 'Failed to update prompt' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}            