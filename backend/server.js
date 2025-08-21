const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

const dataPath = path.join(__dirname, "data", "actividades.json");

app.use(express.json());

let actividades = [];
let idCounter = 1;

// Load activities from file
function cargarActividades() {
    if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, "utf8");
        actividades = JSON.parse(data);
        if (actividades.length > 0) {
            idCounter = Math.max(...actividades.map(a => a.id)) + 1;
        }
    }
}

// Save activities to file
function guardarActividades() {
    fs.writeFileSync(dataPath, JSON.stringify(actividades, null, 2));
}

cargarActividades();

app.use(express.static(path.join(__dirname, "../public")));
// --- Definición de rutas ---

// Ruta para obtener todas las actividades
app.get("/actividades", (req, res) => {
    res.json(actividades);
});

// Ruta para crear una nueva actividad
app.post("/actividades", (req, res) => {
    const { descripcion } = req.body;
    if (!descripcion) {
        return res.status(400).json({ error: "Falta la descripción de la actividad" });
    }
    const nuevaActividad = { id: idCounter++, descripcion, realizada: false };
    actividades.push(nuevaActividad);
    guardarActividades();
    res.status(201).json(nuevaActividad);
});

// Ruta para actualizar una actividad
app.put("/actividades/:id", (req, res) => {
    const { id } = req.params;
    const actividad = actividades.find(a => a.id === parseInt(id));
    if (!actividad) {
        return res.status(404).json({ error: "Actividad no encontrada" });
    }
    actividad.realizada = true;
    guardarActividades();
    res.json(actividad);
});

// Ruta para eliminar una actividad
app.delete("/actividades/:id", (req, res) => {
    const { id } = req.params;
    const index = actividades.findIndex(a => a.id === parseInt(id));
    if (index === -1) {
        return res.status(404).json({ error: "Actividad no encontrada" });
    }
    const eliminada = actividades.splice(index, 1);
    guardarActividades();
    res.json(eliminada[0]);
});
app.get("/actividades", (req, res) => {
    res.json(actividades);
});
app.get("/actividades/", (req, res) => {
    res.json(actividades);
});

// --- Inicio del servidor ---
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});