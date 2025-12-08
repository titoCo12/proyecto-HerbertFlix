const API_BASE = 'http://localhost:3000';

async function cargarWatchlist() {
    const columna = document.getElementById('columna-izquierda');

    
    // Loading
    columna.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
    
    try {
        const respuesta = await fetch(`${API_BASE}/api/mis-pelis/watchlist`);
        const pelis = await respuesta.json();
        
        if (pelis.length === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>Watchlist vacía</h5></div>`;
            return;
        }
        
        columna.innerHTML = `
            <div class="p-3 border-bottom">
                <h4>Watchlist <small class="text-muted">(${pelis.length})</small></h4>
            </div>
            <div style="max-height: calc(100vh - 120px); overflow-y: auto;">
                ${pelis.map(p => `
                    <div class="pelicula-item p-3 border-bottom" 
                         onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})"
                         style="cursor: pointer;">
                        <div class="d-flex">
                            <img src="${p.Poster || 'https://via.placeholder.com/50x75'}" 
                                 style="width: 50px; height: 75px; object-fit: cover; border-radius: 4px;">
                            <div class="ms-3">
                                <h6 class="mb-1">${p.Title || 'Sin título'}</h6>
                                <p class="mb-1 small text-muted">${p.Director || 'Director desconocido'}</p>
                                <span class="badge bg-secondary">${p.Year || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        columna.innerHTML = `<div class="alert alert-danger m-3">Error</div>`;
    }
}

function seleccionarPelicula(pelicula) {
    console.log('Seleccionada:', pelicula);
    // Para la columna derecha después
}