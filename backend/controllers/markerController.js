const { readMarkers, writeMarkers } = require('../utils/fileUtils');

const getMarkers = (req, res) => {
    try {
        const markers = readMarkers();
        res.json(markers);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer marcadores' });
    }
};

const createMarker = (req, res) => {
    try {
        const { lat, lng, name, description } = req.body; // Cambiar title por name
        const markers = readMarkers();

        const newMarker = {
            id: Date.now().toString(),
            lat,
            lng,
            name: name || 'Marcador', // Cambiar title por name
            description: description || '',
            createdAt: new Date().toISOString()
        };

        markers.push(newMarker);
        writeMarkers(markers);

        res.status(201).json(newMarker);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear marcador' });
    }
};

module.exports = { getMarkers, createMarker };