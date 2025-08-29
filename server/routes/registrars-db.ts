import { RequestHandler } from "express";
import { 
  Registrar, 
  AddRegistrarRequest, 
  AddRegistrarResponse, 
  GetRegistrarsResponse 
} from "@shared/internal-api";
import { db } from "../db/connection";

// Get registrar by ID
export const getRegistrarById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT id, name, label, email, api_status, domain_count, status, api_credentials, created_at
      FROM registrars
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Registrar not found" });
    }

    const row = result.rows[0];
    const registrar: Registrar = {
      id: row.id,
      name: row.name,
      label: row.label || "Not set",
      email: row.email || "Not set",
      apiStatus: row.api_status || "Disconnected",
      domainCount: row.domain_count || 0,
      status: row.status || "Disconnected",
      createdAt: row.created_at.toISOString(),
      apiCredentials: row.api_credentials ?
        (typeof row.api_credentials === 'string' ? JSON.parse(row.api_credentials) : row.api_credentials)
        : undefined
    };

    res.json({ success: true, registrar });
  } catch (error) {
    console.error("Error fetching registrar:", error);
    res.status(500).json({ error: "Failed to fetch registrar" });
  }
};

// Get all registrars
export const getRegistrars: RequestHandler = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, name, label, email, api_status, domain_count, status, created_at
      FROM registrars
      ORDER BY created_at DESC
    `);

    const registrars: Registrar[] = result.rows.map(row => {
      // Safely handle created_at conversion
      let createdAt: string;
      try {
        if (row.created_at) {
          const date = typeof row.created_at === 'string' ? new Date(row.created_at) : row.created_at;
          createdAt = date.toISOString();
        } else {
          createdAt = new Date().toISOString(); // Fallback to current time
        }
      } catch (dateError) {
        console.warn('Error converting created_at for registrar:', row.id, dateError);
        createdAt = new Date().toISOString(); // Fallback to current time
      }

      return {
        id: String(row.id),
        name: String(row.name || 'Unknown'),
        label: String(row.label || "Not set"),
        email: String(row.email || "Not set"),
        apiStatus: String(row.api_status || "Disconnected") as 'Connected' | 'Disconnected' | 'Not configured',
        domainCount: Number(row.domain_count) || 0,
        status: String(row.status || "Disconnected") as 'Connected' | 'Disconnected' | 'Unmanaged',
        createdAt
      };
    });

    const response: GetRegistrarsResponse = {
      registrars,
      total: registrars.length
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching registrars:", error);
    res.status(500).json({ error: "Failed to fetch registrars" });
  }
};

// Add a new registrar
export const addRegistrar: RequestHandler = async (req, res) => {
  try {
    const { registrar, apiKey, apiSecret, apiCredentials, label }: AddRegistrarRequest = req.body;

    if (!registrar) {
      const response: AddRegistrarResponse = {
        success: false,
        error: "Registrar name is required"
      };
      return res.status(400).json(response);
    }

    // Use dynamic credentials if provided, otherwise fall back to legacy apiKey/apiSecret
    let credentials: Record<string, string> = {};
    if (apiCredentials && Object.keys(apiCredentials).length > 0) {
      credentials = apiCredentials;
    } else if (apiKey && apiSecret) {
      credentials = { api_key: apiKey, api_secret: apiSecret };
    } else {
      const response: AddRegistrarResponse = {
        success: false,
        error: "API credentials are required"
      };
      return res.status(400).json(response);
    }

    // Check if registrar with same name and label already exists
    const existingResult = await db.query(
      'SELECT id FROM registrars WHERE name = $1 AND label = $2',
      [registrar, label || "Not set"]
    );

    if (existingResult.rows.length > 0) {
      const response: AddRegistrarResponse = {
        success: false,
        error: "A registrar with this name and label already exists"
      };
      return res.status(409).json(response);
    }

    // Create new registrar entry
    const newRegistrarId = Date.now().toString();
    const result = await db.query(`
      INSERT INTO registrars (
        id, name, label, email, api_key, api_secret, api_credentials,
        api_status, domain_count, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      RETURNING id, name, label, email, api_status, domain_count, status, created_at
    `, [
      newRegistrarId,
      registrar,
      label || "Not set",
      "Not set",
      credentials.api_key || null,
      credentials.api_secret || null,
      JSON.stringify(credentials),
      "Connected",
      0,
      "Connected"
    ]);

    const newRegistrar: Registrar = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      label: result.rows[0].label,
      email: result.rows[0].email,
      apiStatus: result.rows[0].api_status,
      domainCount: result.rows[0].domain_count,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at.toISOString()
    };

    const response: AddRegistrarResponse = {
      success: true,
      registrar: newRegistrar
    };

    res.json(response);
  } catch (error) {
    console.error("Error adding registrar:", error);
    res.status(500).json({ error: "Failed to add registrar" });
  }
};

// Update registrar
export const updateRegistrar: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if registrar exists
    const existingResult = await db.query('SELECT id FROM registrars WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: "Registrar not found" });
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (updates.name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      params.push(updates.name);
    }

    if (updates.label !== undefined) {
      paramCount++;
      updateFields.push(`label = $${paramCount}`);
      params.push(updates.label);
    }

    if (updates.email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      params.push(updates.email);
    }

    if (updates.apiKey !== undefined) {
      paramCount++;
      updateFields.push(`api_key = $${paramCount}`);
      params.push(updates.apiKey);
    }

    if (updates.apiSecret !== undefined) {
      paramCount++;
      updateFields.push(`api_secret = $${paramCount}`);
      params.push(updates.apiSecret);
    }

    if (updates.apiStatus !== undefined) {
      paramCount++;
      updateFields.push(`api_status = $${paramCount}`);
      params.push(updates.apiStatus);
    }

    if (updates.status !== undefined) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      params.push(updates.status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    paramCount++;
    const query = `
      UPDATE registrars 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, label, email, api_status, domain_count, status, created_at
    `;
    params.push(id);

    const result = await db.query(query, params);

    const updatedRegistrar: Registrar = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      label: result.rows[0].label,
      email: result.rows[0].email,
      apiStatus: result.rows[0].api_status,
      domainCount: result.rows[0].domain_count,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at.toISOString()
    };

    res.json({ success: true, registrar: updatedRegistrar });
  } catch (error) {
    console.error("Error updating registrar:", error);
    res.status(500).json({ error: "Failed to update registrar" });
  }
};

// Delete registrar
export const deleteRegistrar: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM registrars WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Registrar not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting registrar:", error);
    res.status(500).json({ error: "Failed to delete registrar" });
  }
};

// Test registrar connection
export const testRegistrarConnection: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(`
      SELECT id, name, api_key, api_secret 
      FROM registrars 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Registrar not found" });
    }

    const registrar = result.rows[0];

    // In a real implementation, you would test the actual API connection here
    // For now, we'll simulate a connection test
    const isConnected = Math.random() > 0.2; // 80% success rate

    // Update the registrar status based on connection test
    await db.query(`
      UPDATE registrars 
      SET api_status = $1, status = $2
      WHERE id = $3
    `, [
      isConnected ? "Connected" : "Disconnected",
      isConnected ? "Connected" : "Disconnected",
      id
    ]);

    res.json({ 
      success: true, 
      connected: isConnected,
      message: isConnected ? "Connection successful" : "Connection failed - check your API credentials"
    });
  } catch (error) {
    console.error("Error testing registrar connection:", error);
    res.status(500).json({ error: "Failed to test registrar connection" });
  }
};
