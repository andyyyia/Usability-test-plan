import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- PROYECTOS ---
app.get('/api/proyectos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proyectos ORDER BY fecha_creacion DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/proyectos', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO proyectos (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
    res.status(201).json({ id: result.insertId, nombre, descripcion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/proyectos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM proyectos WHERE id = ?', [id]);
    res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- PLANES DE PRUEBA ---
app.get('/api/planes/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM planes_prueba WHERE proyecto_id = ?', [proyectoId]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/planes', async (req, res) => {
  const data = req.body;
  try {
    // Check if exists
    const [existing] = await pool.query('SELECT id FROM planes_prueba WHERE proyecto_id = ?', [data.proyecto_id]);
    
    if (existing.length > 0) {
      // Update
      await pool.query(
        `UPDATE planes_prueba SET 
        producto=?, pantalla=?, objetivo=?, perfil=?, metodo=?, fecha=?, 
        lugar=?, duracion=?, moderador=?, observador=?, herramienta=?, enlace=?, notas=?
        WHERE proyecto_id=?`,
        [data.producto, data.pantalla, data.objetivo, data.perfil, data.metodo, data.fecha,
         data.lugar, data.duracion, data.moderador, data.observador, data.herramienta, data.enlace, data.notas,
         data.proyecto_id]
      );
      res.json({ message: 'Plan actualizado' });
    } else {
      // Insert
      const [result] = await pool.query(
        `INSERT INTO planes_prueba 
        (proyecto_id, producto, pantalla, objetivo, perfil, metodo, fecha, lugar, duracion, moderador, observador, herramienta, enlace, notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.proyecto_id, data.producto, data.pantalla, data.objetivo, data.perfil, data.metodo, 
         data.fecha, data.lugar, data.duracion, data.moderador, data.observador, data.herramienta, data.enlace, data.notas]
      );
      res.status(201).json({ id: result.insertId });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// --- RUTAS PARA TAREAS DEL PLAN ---
app.get('/api/tareas-plan/:proyectoId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tareas_plan WHERE proyecto_id = ? ORDER BY id ASC', [req.params.proyectoId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tareas del plan' });
  }
});

app.post('/api/tareas-plan/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  const tareas = req.body;
  
  if (!Array.isArray(tareas)) return res.status(400).json({ error: 'Formato inválido' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // Reemplazo total simple para mantener sincronización
    await connection.query('DELETE FROM tareas_plan WHERE proyecto_id = ?', [proyectoId]);
    for (const t of tareas) {
      await connection.query(
        'INSERT INTO tareas_plan (proyecto_id, identificador, escenario, resultado_esperado, metrica_principal, criterio_exito) VALUES (?, ?, ?, ?, ?, ?)',
        [proyectoId, t.identificador, t.escenario, t.resultado_esperado, t.metrica_principal, t.criterio_exito]
      );
    }
    await connection.commit();
    res.json({ message: 'Tareas del plan guardadas con éxito' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al modificar tareas del plan' });
  } finally {
    connection.release();
  }
});

// --- RUTAS PARA TAREAS DEL GUION ---
app.get('/api/tareas-guion/:proyectoId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tareas_guion WHERE proyecto_id = ? ORDER BY id ASC', [req.params.proyectoId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tareas del guion' });
  }
});

app.post('/api/tareas-guion/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  const tareas = req.body;

  if (!Array.isArray(tareas)) return res.status(400).json({ error: 'Formato inválido' });

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM tareas_guion WHERE proyecto_id = ?', [proyectoId]);
    for (const t of tareas) {
      await connection.query(
        'INSERT INTO tareas_guion (proyecto_id, identificador, texto, pregunta, exito_esperado) VALUES (?, ?, ?, ?, ?)',
        [proyectoId, t.identificador, t.texto, t.pregunta, t.exito_esperado]
      );
    }
    await connection.commit();
    res.json({ message: 'Tareas del guion guardadas con éxito' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al modificar tareas del guion' });
  } finally {
    connection.release();
  }
});


// --- OBSERVACIONES ---
app.get('/api/observaciones/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM observaciones WHERE proyecto_id = ?', [proyectoId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/observaciones/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  const observaciones = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM observaciones WHERE proyecto_id = ?', [proyectoId]);
    for (const o of observaciones) {
      await connection.query(
        'INSERT INTO observaciones (proyecto_id, participante, perfil, tarea_id, exito, tiempo, errores, comentarios, problema, severidad, mejora) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [proyectoId, o.participante, o.perfil, o.tarea, o.exito, o.tiempo, o.errores, o.comentarios, o.problema, o.severidad, o.mejora]
      );
    }
    await connection.commit();
    res.json({ message: 'Observaciones guardadas' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

// --- HALLAZGOS ---
app.get('/api/hallazgos/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM hallazgos WHERE proyecto_id = ?', [proyectoId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hallazgos/:proyectoId', async (req, res) => {
  const { proyectoId } = req.params;
  const hallazgos = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM hallazgos WHERE proyecto_id = ?', [proyectoId]);
    for (const h of hallazgos) {
      await connection.query(
        'INSERT INTO hallazgos (proyecto_id, problema, evidencia, frecuencia, severidad, recomendacion, prioridad, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proyectoId, h.problema, h.evidencia, h.frecuencia, h.severidad, h.recomendacion, h.prioridad, h.estado]
      );
    }
    await connection.commit();
    res.json({ message: 'Hallazgos guardados' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
});
