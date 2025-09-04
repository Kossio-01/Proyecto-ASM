const { readMarkers, writeMarkers } = require('../utils/fileUtils');

const getMarkers = (req, res) => {
    try {
        const markers = readMarkers();
        console.log(`📊 Enviando ${markers.length} marcadores`);
        res.json(markers);
    } catch (error) {
        console.error('Error obteniendo marcadores:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const createMarker = (req, res) => {
    try {
        const { name, description, lat, lng } = req.body;

        if (!name || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        const markers = readMarkers();
        const newMarker = {
            id: `marker_${Date.now()}`,
            name,
            description: description || '',
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            createdAt: new Date().toISOString()
        };

        markers.push(newMarker);
        writeMarkers(markers);

        console.log(`💾 Marcador guardado: ${name} en ${lat}, ${lng}`);
        res.status(201).json(newMarker);
    } catch (error) {
        console.error('Error creando marcador:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const deleteMarker = (req, res) => {
    try {
        const { id } = req.params;
        const markers = readMarkers();

        const initialLength = markers.length;
        const filteredMarkers = markers.filter(marker => marker.id !== id);

        if (filteredMarkers.length === initialLength) {
            return res.status(404).json({ error: 'Marcador no encontrado' });
        }

        writeMarkers(filteredMarkers);
        console.log(`🗑️ Marcador eliminado del backend: ${id}`);
        res.json({ message: 'Marcador eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando marcador:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { getMarkers, createMarker, deleteMarker };

const updateMarker = (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, lat, lng } = req.body;

        if (!name || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }

        const markers = readMarkers();
        const markerIndex = markers.findIndex(marker => marker.id === id);

        if (markerIndex === -1) {
            return res.status(404).json({ error: 'Marcador no encontrado' });
        }

        // Actualizar marcador existente
        markers[markerIndex] = {
            ...markers[markerIndex],
            name,
            description: description || '',
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            updatedAt: new Date().toISOString()
        };

        writeMarkers(markers);
        console.log(`✏️ Marcador actualizado: ${name} (${id})`);
        res.json(markers[markerIndex]);
    } catch (error) {
        console.error('Error actualizando marcador:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { getMarkers, createMarker, updateMarker, deleteMarker };