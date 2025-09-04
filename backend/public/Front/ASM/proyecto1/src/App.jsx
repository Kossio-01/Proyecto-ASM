import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import "./App.css";

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* ====== CONTENIDO ====== */
const equipo = [
  { nombre: "Juan Sebastián Vásquez Cossío", rol: "Back-end Developer", foto: "/team/sebastian.jpeg" },
  { nombre: "Joshua Lores Flórez", rol: "Project Manager", foto: "/team/joshua.jpeg" },
  { nombre: "Araly Arroyo Garcés", rol: "Front-end Developer", foto: "/team/araly.jpeg" },
  { nombre: "Juan David Urrea Orejarena", rol: "Front-end Developer", foto: "/team/juan1.jpg" },
  { nombre: "Mariana Rengifo Quintero", rol: "UI / Content Designer", foto: "/team/mariana.jpeg" },
];

const galeria = [
  "/Galeria/xdd.jpeg",
  "/Galeria/lindoo.jpeg",
  "/Galeria/nosexd.jpeg",
  "/Galeria/pajaro.jpeg",
];

const TABS = [
  { id: "inicio", label: "Inicio" },
  { id: "comparativa", label: "Comparativa" },
  { id: "mapa", label: "Mapa Interactivo" },
  { id: "equipo", label: "¿Quiénes somos?" },
  { id: "galeria", label: "Galería" },
  { id: "eventos", label: "Eventos" },
];

// Componente para manejar clics en el mapa
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Componente del mapa interactivo

// Componente del mapa interactivo
function InteractiveMap({ markers, onAddMarker, onMarkerEdit, onDeleteMarker, selectedLayer }) {
  // Remove the local selectedLayer state - use the prop instead

  // Coordenadas precisas del Río Pance
  const rioInicio = [3.3512, -76.6790];  // 3°21'04.3"N 76°40'44.4"W
  const rioFinal = [3.3063, -76.5407];   // 3°18'22.6"N 76°32'26.6"W
  const centroRio = [3.3352623199555205, -76.60448366138233]; // Centro Google Maps

  // Bounds que cubren todo el recorrido del río
  const panceRiverBounds = [
    [3.30, -76.69],  // Suroeste (más amplio)
    [3.36, -76.53]   // Noreste (más amplio)
  ];

  // Configuración de capas disponibles (solo 3 opciones)
  const mapLayers = {
    openstreet: {
      name: '🗺️ Estándar',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/contributors">OpenStreetMap</a> contributors'
    },
    satellite: {
      name: '🛰️ Satelital',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics'
    },
    terrain: {
      name: '🏔️ Terreno',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.opentopomap.org/">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }
  };

  return (
    <div style={{ height: '500px', width: '100%', border: '1px solid #ddd', borderRadius: '8px' }}>
      <MapContainer
        key={selectedLayer}
        center={centroRio}
        zoom={13}
        minZoom={11}
        maxZoom={18}
        maxBounds={panceRiverBounds}
        maxBoundsViscosity={1.0}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={mapLayers[selectedLayer].url}
          attribution={mapLayers[selectedLayer].attribution}
        />
        <MapClickHandler onMapClick={onAddMarker} />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const newPos = e.target.getLatLng();
                const updatedMarker = {
                  ...marker,
                  lat: newPos.lat,
                  lng: newPos.lng
                };
                onMarkerEdit(marker.id, updatedMarker);
              },
              click: () => {
                const element = document.getElementById(`marker-${marker.id}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.style.backgroundColor = '#fff3cd';
                  setTimeout(() => {
                    element.style.backgroundColor = '';
                  }, 2000);
                }
              }
            }}
          >
            <Popup>
              <div
                style={{ textAlign: 'center', minWidth: '200px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <h4 style={{ margin: '0 0 8px 0' }}>{marker.name}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{marker.description}</p>
                <small style={{ color: '#666' }}>
                  📍 {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                </small>
                <br />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMarker(marker.id);
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// Componente lista de marcadores
function MarkerList({ markers, onMarkerEdit, onDeleteMarker, onFocusMarker }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const startEdit = (marker) => {
    setEditingId(marker.id);
    setEditForm({ name: marker.name, description: marker.description });
  };

  const saveEdit = async (markerId) => {
    const marker = markers.find(m => m.id === markerId);
    if (marker && editForm.name.trim()) {
      const updatedMarker = {
        ...marker,
        name: editForm.name.trim(),
        description: editForm.description.trim()
      };
      await onMarkerEdit(markerId, updatedMarker);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  return (
    <div style={{
      maxHeight: '400px',
      overflowY: 'auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      background: 'white'
    }}>
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #eee',
        background: '#f8f9fa',
        fontWeight: 'bold',
        position: 'sticky',
        top: 0
      }}>
        📋 Lista de Marcadores ({markers.length})
      </div>

      {markers.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          No hay marcadores. Haz clic en el mapa para agregar uno.
        </div>
      ) : (
        markers.map((marker, index) => (
          <div
            key={marker.id}
            id={`marker-${marker.id}`}
            style={{
              padding: '12px',
              borderBottom: markers.length - 1 === index ? 'none' : '1px solid #eee',
              transition: 'background-color 0.3s'
            }}
          >
            {editingId === marker.id ? (
              // Modo edición
              <div>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nombre del marcador"
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginBottom: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción"
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '6px',
                    marginBottom: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => saveEdit(marker.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    💾 Guardar
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      padding: '6px 12px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // Modo vista
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{marker.name}</h4>
                    <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
                      {marker.description || 'Sin descripción'}
                    </p>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      📍 {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
                      {marker.createdAt && (
                        <span style={{ marginLeft: '10px' }}>
                          🕐 {new Date(marker.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginLeft: '10px' }}>
                    <button
                      onClick={() => onFocusMarker(marker)}
                      title="Ver en mapa"
                      style={{
                        padding: '4px 8px',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🎯
                    </button>
                    <button
                      onClick={() => startEdit(marker)}
                      title="Editar"
                      style={{
                        padding: '4px 8px',
                        background: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDeleteMarker(marker.id)}
                      title="Eliminar"
                      style={{
                        padding: '4px 8px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("inicio");
  const [markers, setMarkers] = useState([]);
  const [markerCounter, setMarkerCounter] = useState(1);
  const [mapRef, setMapRef] = useState(null);
  const [selectedLayer, setSelectedLayer] = useState('openstreet');

  // Cargar marcadores al iniciar
  useEffect(() => {
    loadMarkers();
  }, []);

  // Funciones para manejar marcadores
  const loadMarkers = async () => {
    try {
      console.log('🔄 Cargando marcadores...');
      const response = await fetch('/api/markers');
      if (response.ok) {
        const data = await response.json();
        setMarkers(data);
        console.log(`✅ ${data.length} marcadores cargados desde el backend`);

        // Verificar en consola del navegador
        console.table(data);
      } else {
        console.error(`❌ Error HTTP: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error cargando marcadores: ${error.message}`);
    }
  };

  const saveMarker = async (markerData) => {
    try {
      console.log('💾 Guardando marcador:', markerData);
      const response = await fetch('/api/markers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markerData)
      });
      if (response.ok) {
        const savedMarker = await response.json();
        console.log(`✅ Marcador guardado en backend: ${savedMarker.name}`);
        return savedMarker;
      } else {
        console.error(`❌ Error guardando: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error de conexión: ${error.message}`);
    }
  };

  const handleAddMarker = async (latlng) => {
    const newMarker = {
      id: `marker_${Date.now()}`,
      name: `Marcador ${markerCounter}`,
      description: 'Nuevo marcador en el río',
      lat: latlng.lat,
      lng: latlng.lng
    };

    // Agregar localmente primero
    setMarkers(prev => [...prev, newMarker]);
    setMarkerCounter(prev => prev + 1);

    // Guardar en backend
    const savedMarker = await saveMarker(newMarker);
    if (savedMarker) {
      // Actualizar con la versión del servidor
      setMarkers(prev => prev.map(m => m.id === newMarker.id ? savedMarker : m));
    }
  };

const handleMarkerEdit = async (markerId, updatedMarker) => {
  try {
    // Actualizar en el backend usando PUT
    const response = await fetch(`/api/markers/${markerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: updatedMarker.name,
        description: updatedMarker.description,
        lat: updatedMarker.lat,
        lng: updatedMarker.lng
      })
    });

    if (response.ok) {
      const serverMarker = await response.json();
      // Actualizar localmente con la versión del servidor
      setMarkers(prev => prev.map(m => m.id === markerId ? serverMarker : m));
      console.log(`✏️ Marcador actualizado: ${updatedMarker.name}`);
    } else {
      console.error(`❌ Error actualizando en backend: ${response.status}`);
      alert('Error actualizando el marcador en el servidor');
    }
  } catch (error) {
    console.error(`❌ Error de conexión actualizando: ${error.message}`);
    alert('Error de conexión al actualizar el marcador');
  }
};

const handleDeleteMarker = async (markerId) => {
  if (confirm('¿Estás seguro de eliminar este marcador?')) {
    try {
      // Eliminar del backend
      const response = await fetch(`/api/markers/${markerId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Eliminar localmente solo si se eliminó del backend
        setMarkers(prev => prev.filter(m => m.id !== markerId));
        console.log(`🗑️ Marcador eliminado: ${markerId}`);
      } else {
        console.error(`❌ Error eliminando del backend: ${response.status}`);
        alert('Error eliminando el marcador del servidor');
      }
    } catch (error) {
      console.error(`❌ Error de conexión: ${error.message}`);
      alert('Error de conexión al eliminar el marcador');
    }
  }
};

  const handleFocusMarker = (marker) => {
    // Cambiar a la pestaña del mapa si no estamos ahí
    if (tab !== 'mapa') {
      setTab('mapa');
      // Esperar un poco para que el mapa se renderice
      setTimeout(() => {
        focusOnMarker(marker);
      }, 100);
    } else {
      focusOnMarker(marker);
    }
  };

  const focusOnMarker = (marker) => {
    // Esto requeriría acceso a la instancia del mapa de Leaflet
    // Por ahora solo mostramos un mensaje
    console.log(`🎯 Enfocando marcador: ${marker.name} en ${marker.lat}, ${marker.lng}`);
  };

  const clearAllMarkers = async () => {
    if (markers.length === 0) {
      alert('No hay marcadores para limpiar');
      return;
    }

    if (confirm(`¿Eliminar todos los ${markers.length} marcadores?`)) {
      try {
        // Eliminar todos los marcadores del backend
        const deletePromises = markers.map(marker =>
          fetch(`/api/markers/${marker.id}`, { method: 'DELETE' })
        );

        await Promise.all(deletePromises);

        // Limpiar localmente solo después de eliminar del backend
        setMarkers([]);
        setMarkerCounter(1);
        console.log('🧹 Todos los marcadores eliminados del backend y localmente');
      } catch (error) {
        console.error('❌ Error eliminando marcadores:', error);
        alert('Error eliminando algunos marcadores del servidor');
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header__row container">
          <h1 className="header__brand">LAS DOS CARAS<br /> DEL RÍO PANCE</h1>
          <nav className="menu" role="tablist" aria-label="Secciones">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`menu__item ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="container panels">
        {/* INICIO */}
        {tab === "inicio" && (
          <section className="hero panel">
            <div className="hero__grid">
              <article className="photoCard">
                <img
                  src="/eventos/inicio.jpg"
                  alt="Río Pance"
                  className="photoCard__media"
                  onError={(e) => {
                    e.target.style.background = '#eef2f7';
                    e.target.alt = 'Imagen del Río Pance';
                  }}
                />
                <div className="photoCard__badge">RÍO PANCE</div>
              </article>
              <article className="mapCard">
                <h3 className="mapCard__caption">MAPA DEL RÍO PANCE</h3>
                <iframe
                  className="mapCard__frame"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.06164824134!2d-76.60689248988994!3d3.3349459519693103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e30a3002303c1d1%3A0x756fb528400f4fa4!2sRio%20Pance%2C%20Cali%2C%20Valle%20del%20Cauca!5e0!3m2!1ses-419!2sco!4v1756783021396!5m2!1ses-419!2sco"
                  title="Mapa del Río Pance"
                />
                <button className="mapCard__cta">Ver recorrido</button>
              </article>
            </div>
          </section>
        )}

        {/* MAPA INTERACTIVO */}
     {tab === "mapa" && (
       <section className="panel">
         <div style={{ marginBottom: '20px' }}>
           <h2>🗺️ Mapa Interactivo del Río Pance</h2>
           <p style={{ color: '#6b7280', marginBottom: '10px' }}>
             📍 Haz clic en el mapa para agregar marcadores • Los marcadores se pueden arrastrar
           </p>
           <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
             {/* Selector de vista del mapa */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <label htmlFor="map-view-selector" style={{ fontSize: '14px', fontWeight: '600' }}>
                 🗺️ Vista:
               </label>
               <select
                 id="map-view-selector"
                 value={selectedLayer}
                 onChange={(e) => setSelectedLayer(e.target.value)}
                 style={{
                   padding: '6px 12px',
                   border: '1px solid #ddd',
                   borderRadius: '6px',
                   fontSize: '14px',
                   cursor: 'pointer',
                   minWidth: '120px',
                   background: 'white'
                 }}
               >
                 <option value="openstreet">🗺️ Estándar</option>
                 <option value="satellite">🛰️ Satelital</option>
                 <option value="terrain">🏔️ Terreno</option>
               </select>
             </div>

             {/* Botones de control */}
             <div style={{ display: 'flex', gap: '10px' }}>
               <button onClick={clearAllMarkers} className="mapCard__cta" style={{ background: '#e53e3e' }}>
                 🧹 Limpiar Todo
               </button>
               <button onClick={loadMarkers} className="mapCard__cta" style={{ background: '#38a169' }}>
                 🔄 Recargar Marcadores
               </button>
             </div>
           </div>
         </div>

         {/* Layout de dos columnas */}
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }} className="mapa-layout">
           {/* Mapa */}
           <div>
             <InteractiveMap
               markers={markers}
               onAddMarker={handleAddMarker}
               onMarkerEdit={handleMarkerEdit}
               onDeleteMarker={handleDeleteMarker}
               selectedLayer={selectedLayer}
             />
             <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
               <strong>📊 Estadísticas:</strong> {markers.length} marcadores en el mapa
             </div>
           </div>

           {/* Lista de marcadores */}
           <div className="marker-list">
             <MarkerList
               markers={markers}
               onMarkerEdit={handleMarkerEdit}
               onDeleteMarker={handleDeleteMarker}
               onFocusMarker={handleFocusMarker}
             />
           </div>
         </div>
       </section>
     )}
        {/* Resto de secciones... */}
        {tab === "comparativa" && (
          <section className="comparativa">
            <h2>Las dos caras de un mismo paseo</h2>
            <div className="compare-grid">
              <div>
                <h3>VISIBLE</h3>
                <div className="grid">
                  {[1,2,3,4,5,6].map(i => (
                    <img key={i} src={`/comparativa/visible${i}.jpeg`} alt={`Visible ${i}`} />
                  ))}
                  <video className="grid-video" controls src="/comparativa/visibleV.mp4" />
                </div>
              </div>
              <div>
                <h3>INVISIBLE</h3>
                <div className="grid">
                  {[1,2,3,4,5,6].map(i => (
                    <img key={i} src={`/comparativa/invisible${i}.jpeg`} alt={`Invisible ${i}`} />
                  ))}
                  <video className="grid-video" controls src="/comparativa/invisibleV.mp4" />
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === "equipo" && (
          <section className="panel">
            <div className="team">
              {equipo.map((p, i) => (
                <figure key={i} className="persona">
                  <img className="avatar" src={p.foto} alt={p.nombre} />
                  <figcaption>
                    <strong>{p.nombre}</strong>
                    <br />
                    <span>{p.rol}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {tab === "galeria" && (
          <section className="panel">
            <div className="gallery">
              {galeria.map((src, i) => (
                <figure key={i} className="gitem">
                  <img src={src} alt={`Galería ${i + 1}`} />
                </figure>
              ))}
            </div>
          </section>
        )}

{tab === "eventos" && (
  <section className="panel">
    <h2>📅 Eventos Ambientales</h2>
    <div className="events">
      {[
        {
          title: "Caminata ecológica",
          image: "/eventos/caminatas.jpg",
          description: "Recorridos guiados por el río para conocer la biodiversidad local"
        },
        {
          title: "Jornada de limpieza",
          image: "/eventos/limpieza.jpg",
          description: "Actividades comunitarias para mantener limpio nuestro río"
        },
        {
          title: "Charlas ambientales",
          image: "/eventos/charlas.jpg",
          description: "Conferencias educativas sobre conservación y medio ambiente"
        }
      ].map((evento, i) => (
        <article key={i} className="event">
          <img
            src={evento.image}
            alt={evento.title}
            className="event__media"
            onError={(e) => {
              e.target.style.background = '#f1f5f9';
              e.target.alt = `Imagen de ${evento.title}`;
            }}
          />
          <div className="event__body">
            <h4>{evento.title}</h4>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
              {evento.description}
            </p>
            <button className="btn">Proximamente</button>
          </div>
        </article>
      ))}
    </div>
  </section>
)}
<footer className="footer">
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
    <img
      src="/eventos/logo.png"
      alt="Universidad Autónoma de Occidente"
      style={{
        height: '40px',
        width: 'auto',
      }}
      onError={(e) => {
        e.target.style.display = 'none';
      }}
    />
    <p style={{ margin: 0 }}>
      &copy; 2024 Proyecto Río Pance - Universidad Autónoma de Occidente - ASM
    </p>
  </div>
</footer>
        </main>
        </div>
    );
    }