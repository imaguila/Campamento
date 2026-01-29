import express, { Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Database connection configuration
// In Codespaces, this URL is provided via docker-compose.yml
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// --- AUTHENTICATION ---

/**
 * SPRINT 1: Temporary Login for Development
 * Allows access using the admin@camp.com email bypass
 */
app.post('/api/login', (req: Request, res: Response) => {
    const { email } = req.body;
    
    // Check for the specific dev email
    if (email === 'admin@camp.com') {
        return res.json({ 
            id: "00000000-0000-0000-0000-000000000000", 
            name: "Admin User", 
            role: "administrator",
            token: "mock-jwt-token-for-dev"
        });
    }
    
    res.status(401).json({ error: "Unauthorized: Please use admin@camp.com for testing." });
});


// --- PARENT MANAGEMENT ---

/**
 * SPRINT 1: Create Parent Account
 * Required so parents can begin the enrollment process online
 */
app.post('/api/parents', async (req: Request, res: Response) => {
    const { name, email, phone } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO camp_system.parents (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
            [name, email, phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating parent record' });
    }
});


// --- CAMPER MANAGEMENT ---

/**
 * SPRINT 1: Register/Enroll a Camper
 * Links the child to the parent and stores critical medical info
 */
app.post('/api/campers', async (req: Request, res: Response) => {
  const { firstName, lastName, parentId, medicalInfo, emergencyContact } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO camp_system.campers 
       (first_name, last_name, parent_id, medical_info, emergency_contact, status) 
       VALUES ($1, $2, $3, $4, $5, 'enrolled') 
       RETURNING *`,
      [firstName, lastName, parentId, medicalInfo, emergencyContact]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error occurred during registration' });
  }
});

/**
 * SPRINT 1: Fetch Camper Records
 * Allows admins to view medical forms/allergy info for safety
 */
app.get('/api/campers', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM camp_system.campers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching camper list' });
    }
});

app.get('/api/campers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM camp_system.campers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Camper not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching records' });
  }
});

// --- SERVER START ---

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🚀 Camp Management API is running!
  ----------------------------------
  Endpoint: http://localhost:${PORT}
  Database: Connected to PostgreSQL
  Test Login: admin@camp.com
  `);
});