const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());

// Conexión a MySQL
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "linkedos"
});

con.connect(err => {
  if (err) throw err;
  console.log("Conectado a MySQL");
});


// Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
  const sql = "SELECT * FROM usuarios";
  con.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});



// Ruta para iniciar sesión
app.post('/api/login', async (req, res) => {
  const { nombre_usuario, contrasenia_usuario } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE nombre_usuario = ?';
  con.query(sql, [nombre_usuario], async (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false });
    }

    const usuario = results[0];

    try {
      const match = await bcrypt.compare(contrasenia_usuario, usuario.contrasenia_usuario);
      console.log(contrasenia_usuario, usuario);

      if (match) {
        res.json({
          success: true,
          nombre_usuario: usuario.nombre_usuario,
          tipo_usuario: usuario.tipo_usuario,
          id_usuario: usuario.id_usuario
        });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.error('Error al comparar contraseña:', error);
      res.status(500).json({ success: false });
    }
  });
});






// Ruta para registro
app.post('/api/registro', async (req, res) => {
  const { nombre_usuario, contrasenia_usuario, tipo_usuario } = req.body;

  try {
    const hash = await bcrypt.hash(contrasenia_usuario, 10); // Encriptar la contraseña

    const sql = 'INSERT INTO usuarios (nombre_usuario, contrasenia_usuario, tipo_usuario) VALUES (?, ?, ?)';
    con.query(sql, [nombre_usuario, hash, tipo_usuario], (err, result) => {
      if (err) {
        console.error('Error al registrar usuario:', err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    });
  } catch (error) {
    console.error('Error al encriptar la contraseña:', error);
    res.status(500).json({ success: false });
  }
});


// Ruta para publicar
app.post('/api/publicar', (req, res) => {
  const { id_empresa, empleo, descripcion } = req.body;

  if (!id_empresa || !empleo) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  const query = 'INSERT INTO publicaciones (id_empresa, empleo, descripcion) VALUES (?, ?, ?)';
  con.query(query, [id_empresa, empleo, descripcion], (err, result) => {
    if (err) {
      console.error('Error al insertar publicación:', err);
      return res.status(500).json({ success: false, message: 'Error al insertar en la base de datos' });
    }

    res.json({ success: true });
  });
});

// Ruta para mostrar publicaciones
app.get('/api/publicaciones', (req, res) => {
  const query = `
    SELECT p.*, u.nombre_usuario AS nombre_empresa
    FROM publicaciones p
    JOIN usuarios u ON p.id_empresa = u.id_usuario
    ORDER BY p.id_publicacion DESC
  `;

  con.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener publicaciones:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener publicaciones' });
    }

    res.json({ success: true, publicaciones: results });
  });
});

// Ruta para registrar inscripciones
app.post('/api/inscribirse', (req, res) => {
  const { id_usuario, id_publicacion } = req.body;

  if (!id_usuario || !id_publicacion) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  const query = 'INSERT INTO inscripciones (id_usuario, id_publicacion) VALUES (?, ?)';

  con.query(query, [id_usuario, id_publicacion], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.json({ success: false, message: 'Ya estás inscrito en esta publicación' });
      }
      console.error('Error al inscribirse:', err);
      return res.status(500).json({ success: false, message: 'Error al inscribirse' });
    }

    res.json({ success: true, message: 'Inscripción realizada con éxito' });
  });
});

// Ruta para mostrar inscripciones
app.get('/api/inscripciones/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;

  const query = `
    SELECT p.id_publicacion, p.empleo, p.descripcion
    FROM inscripciones i
    JOIN publicaciones p ON i.id_publicacion = p.id_publicacion
    WHERE i.id_usuario = ?
  `;

  con.query(query, [id_usuario], (err, results) => {
    if (err) {
      console.error('Error al obtener inscripciones:', err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, inscripciones: results });
  });
});

// Ruta para eliminar una inscripción
app.delete('/api/inscripciones', (req, res) => {
  const { id_usuario, id_publicacion } = req.body;

  if (!id_usuario || !id_publicacion) {
    return res.status(400).json({ success: false, message: 'Datos incompletos' });
  }

  const query = 'DELETE FROM inscripciones WHERE id_usuario = ? AND id_publicacion = ?';

  con.query(query, [id_usuario, id_publicacion], (err, result) => {
    if (err) {
      console.error('Error al eliminar inscripción:', err);
      return res.status(500).json({ success: false, message: 'Error al eliminar la inscripción' });
    }

    res.json({ success: true, message: 'Inscripción eliminada correctamente' });
  });
});

// Ruta para filtrar publicaciones
app.get('/api/publicaciones/empresa/:idEmpresa', (req, res) => {
  const { idEmpresa } = req.params;

  const query = 'SELECT * FROM publicaciones WHERE id_empresa = ?';
  con.query(query, [idEmpresa], (err, results) => {
    if (err) {
      console.error('Error al obtener publicaciones de empresa:', err);
      return res.status(500).json({ success: false, message: 'Error al obtener publicaciones de empresa' });
    }

    res.json({ success: true, publicaciones: results });
  });
});

// Eliminar publicación y sus inscripciones
app.delete('/api/publicaciones', (req, res) => {
  const { id_publicacion } = req.body;

  if (!id_publicacion) {
    return res.status(400).json({ success: false, message: 'ID de publicación requerido' });
  }

  // Primero eliminamos las inscripciones asociadas a la publicación
  const eliminarInscripciones = 'DELETE FROM inscripciones WHERE id_publicacion = ?';
  con.query(eliminarInscripciones, [id_publicacion], (err, resultInscripciones) => {
    if (err) {
      console.error('Error al eliminar inscripciones:', err);
      return res.status(500).json({ success: false, message: 'Error al eliminar inscripciones asociadas' });
    }

    // Luego eliminamos la publicación
    const eliminarPublicacion = 'DELETE FROM publicaciones WHERE id_publicacion = ?';
    con.query(eliminarPublicacion, [id_publicacion], (err, resultPublicacion) => {
      if (err) {
        console.error('Error al eliminar publicación:', err);
        return res.status(500).json({ success: false, message: 'Error al eliminar la publicación' });
      }

      res.json({ success: true, message: 'Publicación e inscripciones eliminadas correctamente' });
    });
  });
});

// Enviar mensaje
app.post('/api/mensajes/enviar', (req, res) => {
  const { id_usuario, id_empresa, contenido, emisor } = req.body;

  const sql = `INSERT INTO mensajes (id_usuario, id_empresa, contenido, emisor, fecha_envio)
               VALUES (?, ?, ?, ?, NOW())`;

  con.query(sql, [id_usuario, id_empresa, contenido, emisor], (err, result) => {
    if (err) {
      console.error("Error al insertar mensaje:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.status(201).json({ success: true, mensaje: 'Mensaje enviado correctamente' });
  });
});



// Obtener conversaciones para un usuario (ya sea normal o empresa)
app.get('/api/mensajes/conversaciones', (req, res) => {
  const { tipo_usuario, id_usuario } = req.query;

  const sql = tipo_usuario === 'usuario'
    ? `SELECT DISTINCT u.id_usuario AS id, u.nombre_usuario AS nombre
         FROM mensajes m
         JOIN usuarios u ON u.id_usuario = m.id_empresa
         WHERE m.id_usuario = ?`
    : `SELECT DISTINCT u.id_usuario AS id, u.nombre_usuario AS nombre
         FROM mensajes m
         JOIN usuarios u ON u.id_usuario = m.id_usuario
         WHERE m.id_empresa = ?`;

  con.query(sql, [id_usuario], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});


// Obtener mensajes entre dos usuarios
app.get('/api/mensajes/conversacion', (req, res) => {
  const { id_usuario, id_empresa } = req.query;
  const sql = `SELECT * FROM mensajes
               WHERE id_usuario = ? AND id_empresa = ?
               ORDER BY fecha_envio ASC`;

  con.query(sql, [id_usuario, id_empresa], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});




app.listen(port, () => {
  console.log('Servidor corriendo en http://localhost:${port}');
});

