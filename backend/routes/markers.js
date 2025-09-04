const express = require('express');
const router = express.Router();
const { getMarkers, createMarker, updateMarker, deleteMarker } = require('../controllers/markerController');

router.get('/', getMarkers);
router.post('/', createMarker);
router.put('/:id', updateMarker);  // Nueva ruta para actualizar
router.delete('/:id', deleteMarker);

module.exports = router;