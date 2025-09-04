// Cargar dotenv solo en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// 🔍 DEBUGGING mejorado
console.log('🚀 Iniciando servidor...');
console.log('🔧 Variables de entorno:');
console.log('- PORT:', process.env.PORT || 'No definido (usando 8000)');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'No definido');
console.log('- __dirname:', __dirname);

// Verificar estructura de archivos
const distPath = path.join(__dirname, 'public/Front/ASM/proyecto1/dist');
const indexPath = path.join(distPath, 'index.html');

console.log('📁 Verificando archivos:');
console.log('- Carpeta dist existe:', fs.existsSync(distPath));
console.log('- index.html existe:', fs.existsSync(indexPath));

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log('- Archivos en dist:', files.slice(0, 5)); // Mostrar solo 5
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Manejo de errores global
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error.message);
});

// Rutas de API (ANTES de archivos estáticos)
try {
  app.use('/api/markers', require('./routes/markers'));
  console.log('✅ Rutas de marcadores cargadas');
} catch (error) {
  console.error('❌ Error cargando rutas de marcadores:', error.message);
}

// API de prueba
app.get('/api/saludo', (req, res) => {
  console.log('🔔 API de saludo llamada');
  res.json({
    mensaje: '¡Hola desde el backend!',
    puerto: PORT,
    entorno: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Servir archivos estáticos de React
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Sirviendo archivos estáticos desde:', distPath);
} else {
  console.error('❌ No se encontró la carpeta dist');
}

// Ruta catch-all para React Router
app.get('*', (req, res) => {
  console.log('📄 Solicitando:', req.path);

  if (req.path.startsWith('/api')) {
    console.log('❌ API no encontrada:', req.path);
    return res.status(404).json({ error: 'API no encontrada' });
  }

  if (fs.existsSync(indexPath)) {
    console.log('✅ Sirviendo index.html para:', req.path);
    res.sendFile(indexPath);
  } else {
    console.error('❌ index.html no encontrado en:', indexPath);
    res.status(404).send('Aplicación no encontrada');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌍 Sirviendo React desde: ${distPath}`);
    console.log(`🔗 URL base: http://localhost:${PORT}`);
    console.log(`🧪 API de prueba: http://localhost:${PORT}/api/saludo`);
});