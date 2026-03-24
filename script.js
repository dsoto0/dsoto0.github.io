// Variables globales
let map;
let markers = [];
let conflictsData = [];
let filteredConflicts = [];

// Colores por tipo de conflicto
const colorsPorTipo = {
    'Terrorismo': '#e74c3c',
    'Guerra': '#c0392b',
    'Disturbio Civil': '#f39c12',
    'Insurgencia': '#e67e22',
    'Conflicto Regional': '#9b59b6'
};

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadConflictsData();
    setupEventListeners();
});

/**
 * Inicializar el mapa con Leaflet
 */
function initializeMap() {
    // Centro en África (aproximadamente)
    const africaCenter = [-8.7832, 34.5085];
    
    map = L.map('map').setView(africaCenter, 4);
    
    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 3
    }).addTo(map);
    
    // Agregar control de zoom
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);
}

/**
 * Cargar datos de conflictos desde JSON
 */
function loadConflictsData() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            conflictsData = data;
            filteredConflicts = [...conflictsData];
            addMarkersToMap(filteredConflicts);
            updateConflictsList(filteredConflicts);
            updateConflictCount(filteredConflicts.length);
        })
        .catch(error => {
            console.error('Error cargando datos:', error);
            alert('Error al cargar los datos de conflictos');
        });
}

/**
 * Obtener coordenadas aproximadas de un país
 * (En un proyecto real, usarías una API o una tabla de datos)
 */
function getCountryCoordinates(pais) {
    const coordenadas = {
        'Nigeria': [9.0765, 7.3986],
        'Somalia': [5.1521, 46.1996],
        'Sudán': [12.8628, 30.2176],
        'Sudán del Sur': [6.8770, 31.3070],
        'Uganda': [1.3733, 32.2903],
        'Kenia': [-0.0236, 37.9062],
        'Etiopía': [9.1450, 40.4897],
        'Malí': [17.5707, -4.0026],
        'Burkina Faso': [12.2383, -1.5616],
        'República Democrática del Congo': [-4.0383, 21.7587],
        'Congo': [-4.0383, 21.7587],
        'República Centroafricana': [6.6111, 20.9394],
        'Camerún': [3.8480, 11.5021],
        'Libia': [26.3351, 17.2283],
        'Argelia': [28.0339, 1.6596],
        'Túnez': [33.8869, 9.5375],
        'Marruecos': [31.7917, -7.0926],
        'Mauritania': [21.0079, -10.9408],
        'Sierra Leona': [8.4606, -11.7799],
        'Liberia': [6.4281, -9.4295],
        'Guinea': [9.9456, -9.6966],
        'Costa de Marfil': [7.5400, -5.5471],
        'Ghana': [7.3697, -5.7456],
        'Togo': [6.1256, 1.2320],
        'Benín': [9.3077, 2.3158],
        'Níger': [17.6078, 8.6753],
        'Chad': [15.4542, 18.7322],
        'Angola': [-11.2027, 17.8739],
        'Zambia': [-13.1339, 27.8493],
        'Zimbabue': [-19.0154, 29.1549],
        'Mozambique': [-18.6657, 35.5296],
        'Botsuana': [-22.3285, 24.6849],
        'Namibia': [-22.9375, 18.6883],
        'Sudáfrica': [-30.5595, 22.9375],
        'Ruanda': [-1.9536, 29.8739],
        'Burundi': [-3.5731, 29.9189],
        'Tanzania': [-6.3690, 34.8888],
        'Malawi': [-13.4549, 34.3015],
        'Lesoto': [-29.6100, 28.2336],
        'Esuatini': [-26.5225, 31.4659],
        'Madagascar': [-18.7669, 46.8691],
        'Mauricio': [-20.3484, 57.5522],
        'Seychelles': [-4.6796, 55.4920],
        'Comoras': [-11.9408, 43.3333]
    };
    
    return coordenadas[pais] || [0, 0];
}

/**
 * Crear icono personalizado para los marcadores
 */
function createCustomIcon(tipo) {
    const color = colorsPorTipo[tipo] || '#3498db';
    
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; 
               border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
               display: flex; align-items: center; justify-content: center; color: white; 
               font-weight: bold; font-size: 16px;">◆</div>`,
        iconSize: [30, 30],
        className: `marker-icon-${tipo.toLowerCase().replace(/\s+/g, '')}`
    });
}

/**
 * Agregar marcadores al mapa
 */
function addMarkersToMap(conflictos) {
    // Limpiar marcadores anteriores
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    conflictos.forEach(conflicto => {
        const coords = getCountryCoordinates(conflicto.pais);
        
        if (coords[0] === 0 && coords[1] === 0) {
            console.warn(`País no encontrado: ${conflicto.pais}`);
            return;
        }
        
        // Crear popup
        const popupContent = createPopupContent(conflicto);
        
        // Crear marcador
        const marker = L.marker(coords, {
            icon: createCustomIcon(conflicto.tipo)
        })
        .bindPopup(popupContent, {
            maxWidth: 300,
            className: 'conflict-popup'
        })
        .on('click', function() {
            highlightConflictInList(conflicto);
        })
        .addTo(map);
        
        markers.push(marker);
    });
}

/**
 * Crear contenido del popup
 */
function createPopupContent(conflicto) {
    const estado = conflicto.ano_fin ? '✓ Finalizado' : '⚠ Activo';
    const estadoColor = conflicto.ano_fin ? '#27ae60' : '#e74c3c';
    
    let html = `
        <div class="popup-content">
            <h3>${conflicto.nombre_conflicto}</h3>
            <p><strong>País:</strong> ${conflicto.pais}</p>
            <p><strong>Región:</strong> ${conflicto.region}</p>
            <p><strong>Tipo:</strong> <span style="background: ${colorsPorTipo[conflicto.tipo]}; 
               color: white; padding: 2px 6px; border-radius: 3px; font-size: 0.85em;">
               ${conflicto.tipo}</span></p>
            <p><strong>Período:</strong> ${conflicto.ano_inicio} - ${conflicto.ano_fin || 'Presente'}</p>
            <p><strong>Estado:</strong> <span style="color: ${estadoColor}; font-weight: bold;">
               ${estado}</span></p>
            <p><strong>Descripción:</strong> ${conflicto.descripcion}</p>
        </div>
    `;
    
    return html;
}

/**
 * Destacar un conflicto en la lista
 */
function highlightConflictInList(conflicto) {
    const items = document.querySelectorAll('.conflict-item');
    items.forEach(item => item.classList.remove('active'));
    
    const item = Array.from(items).find(el => 
        el.textContent.includes(conflicto.nombre_conflicto)
    );
    if (item) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Actualizar lista de conflictos en el sidebar
 */
function updateConflictsList(conflictos) {
    const listContainer = document.getElementById('conflictsList');
    listContainer.innerHTML = '';
    
    conflictos.forEach(conflicto => {
        const item = document.createElement('div');
        item.className = 'conflict-item';
        item.innerHTML = `
            <div class="conflict-item-title">${conflicto.nombre_conflicto}</div>
            <div class="conflict-item-subtitle">
                <strong>${conflicto.pais}</strong> • ${conflicto.tipo}
            </div>
        `;
        
        item.addEventListener('click', () => {
            const coords = getCountryCoordinates(conflicto.pais);
            map.setView(coords, 6);
            
            // Buscar y abrir el popup del marcador
            const marker = markers.find(m => 
                Math.abs(m.getLatLng().lat - coords[0]) < 0.1 && 
                Math.abs(m.getLatLng().lng - coords[1]) < 0.1
            );
            if (marker) {
                marker.openPopup();
            }
        });
        
        listContainer.appendChild(item);
    });
}

/**
 * Actualizar contador de conflictos
 */
function updateConflictCount(count) {
    document.getElementById('conflictCount').textContent = count;
}

/**
 * Aplicar filtros
 */
function applyFilters() {
    const tipoConflicto = Array.from(document.getElementById('tipoConflicto').selectedOptions)
        .map(opt => opt.value)
        .filter(v => v);
    
    const annoInicio = parseInt(document.getElementById('annoInicio').value) || 1950;
    const annoFin = parseInt(document.getElementById('annoFin').value) || 2026;
    
    const regiones = Array.from(document.getElementById('region').selectedOptions)
        .map(opt => opt.value)
        .filter(v => v);
    
    filteredConflicts = conflictsData.filter(conflicto => {
        // Filtro por tipo
        if (tipoConflicto.length > 0 && !tipoConflicto.includes(conflicto.tipo)) {
            return false;
        }
        
        // Filtro por año
        if (conflicto.ano_inicio > annoFin || (conflicto.ano_fin && conflicto.ano_fin < annoInicio)) {
            return false;
        }
        
        // Filtro por región
        if (regiones.length > 0 && !regiones.includes(conflicto.region)) {
            return false;
        }
        
        return true;
    });
    
    // Actualizar mapa y lista
    addMarkersToMap(filteredConflicts);
    updateConflictsList(filteredConflicts);
    updateConflictCount(filteredConflicts.length);
    
    // Cerrar sidebar en móviles
    closeSidebar();
}

/**
 * Limpiar filtros
 */
function clearFilters() {
    document.getElementById('tipoConflicto').value = '';
    document.getElementById('annoInicio').value = '';
    document.getElementById('annoFin').value = '';
    document.getElementById('region').value = '';
    
    filteredConflicts = [...conflictsData];
    addMarkersToMap(filteredConflicts);
    updateConflictsList(filteredConflicts);
    updateConflictCount(filteredConflicts.length);
}

/**
 * Abrir sidebar en móviles
 */
function openSidebar() {
    document.querySelector('.sidebar').classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar sidebar en móviles
 */
function closeSidebar() {
    document.querySelector('.sidebar').classList.remove('active');
    document.body.style.overflow = 'auto';
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Botones de filtros
    document.getElementById('aplicarFiltros').addEventListener('click', applyFilters);
    document.getElementById('limpiarFiltros').addEventListener('click', clearFilters);
    
    // Toggle sidebar en móviles
    document.getElementById('toggleSidebar').addEventListener('click', openSidebar);
    document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
    
    // Cerrar sidebar al hacer clic fuera (en móviles)
    document.getElementById('map').addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    });
}

// Ajustar sidebar al cambiar tamaño de ventana
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        closeSidebar();
    }
});
