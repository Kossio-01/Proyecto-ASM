const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors()); // Permite peticiones desde cualquier origen

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'public/Front/ASM/proyecto1')));

// Para cualquier ruta que no sea API, servir index.html del frontend
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public/Front/ASM/proyecto1', 'index.html'));
  }
});

app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: '¡Hola desde el backend!' });
});

app.listen(3001, () => {
  console.log('Backend corriendo en puerto 3001');
});
