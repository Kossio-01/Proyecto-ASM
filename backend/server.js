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

// Verificar múltiples rutas posibles para los archivos
const possiblePaths = [
  path.join(__dirname, 'public/Front/ASM/proyecto1/dist'),
  path.join(__dirname, 'public/dist'),
  path.join(__dirname, 'dist'),
  path.join(process.cwd(), 'public/Front/ASM/proyecto1/dist')
];

let distPath = null;
let indexPath = null;

console.log('📁 Verificando rutas posibles:');
for (const p of possiblePaths) {
  console.log(`- Verificando: ${p} -> ${fs.existsSync(p) ? '✅ Existe' : '❌ No existe'}`);
  if (fs.existsSync(p)) {
    const indexFile = path.join(p, 'index.html');
    if (fs.existsSync(indexFile)) {
      distPath = p;
      indexPath = indexFile;
      console.log(`✅ Usando: ${distPath}`);
      break;
    }
  }
}

if (distPath && fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log('- Archivos en dist:', files);
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
    timestamp: new Date().toISOString(),
    distPath: distPath || 'No encontrado',
    filesFound: distPath ? fs.readdirSync(distPath) : []
  });
});

// API de diagnóstico para archivos
app.get('/api/debug', (req, res) => {
  res.json({
    __dirname,
    'process.cwd()': process.cwd(),
    distPath,
    indexPath,
    'distExists': distPath ? fs.existsSync(distPath) : false,
    'indexExists': indexPath ? fs.existsSync(indexPath) : false,
    'files': distPath && fs.existsSync(distPath) ? fs.readdirSync(distPath) : []
  });
});

// Servir archivos estáticos de React
if (distPath && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Sirviendo archivos estáticos desde:', distPath);
} else {
  console.error('❌ No se encontró la carpeta dist en ninguna ruta');

  // Fallback: intentar servir desde múltiples ubicaciones
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      app.use(express.static(p));
      console.log(`🔄 Fallback: Sirviendo desde ${p}`);
      distPath = p;
      indexPath = path.join(p, 'index.html');
      break;
    }
  }
}

// Ruta catch-all para React Router
app.get('*', (req, res) => {
  console.log('📄 Solicitando:', req.path);

  if (req.path.startsWith('/api')) {
    console.log('❌ API no encontrada:', req.path);
    return res.status(404).json({ error: 'API no encontrada' });
  }

  if (indexPath && fs.existsSync(indexPath)) {
    console.log('✅ Sirviendo index.html para:', req.path);
    res.sendFile(indexPath);
  } else {
    console.error('❌ index.html no encontrado');
    res.status(404).send(`
      <h1>🔍 Archivo no encontrado</h1>
      <p>La aplicación React no está disponible.</p>
      <p>Ruta buscada: ${indexPath || 'No definida'}</p>
      <p><a href="/api/debug">Ver información de debugging</a></p>
      <p><a href="/api/saludo">Probar API</a></p>
    `);
  }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌍 Sirviendo React desde: ${distPath || 'No encontrado'}`);
    console.log(`🔗 URL base: http://localhost:${PORT}`);
    console.log(`🧪 API de prueba: http://localhost:${PORT}/api/saludo`);
    console.log(`🔍 Debug: http://localhost:${PORT}/api/debug`);
});