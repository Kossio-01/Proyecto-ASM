const fs = require('fs');
const path = require('path');

const markersFilePath = path.join(__dirname, '../data/markers.json');

const readMarkers = () => {
    try {
        if (!fs.existsSync(markersFilePath)) {
            return [];
        }
        const data = fs.readFileSync(markersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeMarkers = (markers) => {
    try {
        const dir = path.dirname(markersFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(markersFilePath, JSON.stringify(markers, null, 2));
    } catch (error) {
        console.error('Error escribiendo marcadores:', error);
    }
};

module.exports = { readMarkers, writeMarkers };