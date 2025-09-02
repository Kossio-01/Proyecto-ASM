const express = require('express');
const router = express.Router();
const { getMarkers, createMarker } = require('../controllers/markerController');

router.get('/', getMarkers);
router.post('/', createMarker);

module.exports = router;