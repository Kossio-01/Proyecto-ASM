require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// 🔍 DEBUGGING para Azure
console.log('🔧 Variables de entorno:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- __dirname:', __dirname);
console.log('- Archivos en dist:', require('fs').existsSync(path.join(__dirname, 'public/Front/ASM/proyecto1/dist')));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de API (ANTES de archivos estáticos)
app.use('/api/markers', require('./routes/markers'));

// API de prueba
app.get('/api/saludo', (req, res) => {
  res.json({
    mensaje: '¡Hola desde el backend!',
    puerto: PORT,
    entorno: process.env.NODE_ENV
  });
});

// Servir el BUILD de React
const staticPath = path.join(__dirname, 'public/Front/ASM/proyecto1/dist');
app.use(express.static(staticPath));

// Para cualquier ruta que NO sea API, servir el index.html de React
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(staticPath, 'index.html');
    console.log('📄 Sirviendo index.html desde:', indexPath);
    res.sendFile(indexPath);
  }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌍 Sirviendo React desde: ${staticPath}`);
});