require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de API (ANTES de archivos estáticos)
app.use('/api/markers', require('./routes/markers'));

// API de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: '¡Hola desde el backend!' });
});

// Servir el BUILD de React (no el src)
app.use(express.static(path.join(__dirname, 'public/Front/ASM/proyecto1/dist')));

// Para cualquier ruta que NO sea API, servir el index.html de React
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public/Front/ASM/proyecto1/dist', 'index.html'));
  }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌍 Sirviendo React desde: ${path.join(__dirname, 'public/Front/ASM/proyecto1/dist')}`);
});