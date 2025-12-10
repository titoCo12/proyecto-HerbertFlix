// renders.js
const API_BASE = 'http://localhost:3000';


export async function verificarWatchlist(imdb_id) {
    try {
        const respuesta = await fetch(`${API_BASE}/api/mis-pelis/watchlist/${imdb_id}`);
        const data = await respuesta.json();
        
        return data.existe && data.peli !== null;
        
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

export function obtenerPosterSeguro(poster) {
    if (!poster || poster === 'N/A' || poster === null) {
        return 'https://via.placeholder.com/50x75?text=No+Poster';
    }
    if (poster.includes('amazon.com') || poster.includes('amazonaws.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(poster)}&w=300`;
    }
    return poster;
}

export function mostrarSpinner(columna) {
    columna.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
}

export function renderizarLista(columna, titulo, cantidad, itemsHtml) {
    columna.innerHTML = `
        <div class="p-3 border-bottom">
            <h4>${titulo} <small class="text-muted">(${cantidad})</small></h4>
        </div>
        <div style="max-height: calc(100vh - 120px); overflow-y: auto;">
            ${itemsHtml}
        </div>
    `;
}

export async function renderizarDetalles(pelicula) {
    const columnaDerecha = document.getElementById('columna-derecha');
    
    const posterUrl = obtenerPosterSeguro(pelicula.poster);
    const posterGrande = posterUrl.replace('SX300', 'SX600').replace('300', '500');
    
    const estaEnWatchlist = await verificarWatchlist(pelicula.imdb_id);
    
    const botonWatchlist = estaEnWatchlist
        ? `<button class="btn btn-danger" 
            style="color: #dc3545 !important; border-color: #dc3545 !important; 
            background-color: white !important;"
            onclick="removerDeWatchlist('${pelicula.imdb_id}')">
              <i class="bi bi-x-circle"></i> Remove from Watchlist
           </button>`
        : `<button class="btn btn-success" 
             style="color: #0a748aff !important; border-color: #0d89a2ff !important; 
             background-color: white !important;"
            onclick="agregarAWatchlist('${pelicula.imdb_id}')">
              <i class="bi bi-plus-circle"></i> Add to Watchlist
           </button>`;

    columnaDerecha.innerHTML = `
        <div class="p-4">
            <div class="text-center mb-4">
                <img src="${posterGrande}" 
                     class="img-fluid rounded shadow" 
                     style="max-height: 400px;"
                     alt="${pelicula.titulo}">
            </div>
            <h2>${pelicula.titulo}</h2>
            <div class="mb-3">
                <span class="badge bg-primary">${pelicula.anio}</span>
                <span class="badge bg-secondary ms-1">${pelicula.duracion_minutos} min</span>
                <span class="badge bg-warning ms-1">⭐ ${pelicula.rating_imdb}</span>
            </div>
            
            <p class="text-muted">
                <strong>Director:</strong> ${pelicula.director || 'N/A'}<br>
                <strong>Country:</strong> ${pelicula.pais || 'N/A'}<br>
                <strong>Language:</strong> ${pelicula.idioma || 'N/A'}
            </p>
            
            <div class="accordion" id="detallesAcordeon">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sinopsis">
                            Synopsis
                        </button>
                    </h2>
                    <div id="sinopsis" class="accordion-collapse collapse show" data-bs-parent="#detallesAcordeon">
                        <div class="accordion-body">
                            ${pelicula.sinopsis || 'No Info available.'}
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#generos">
                            Genres
                        </button>
                    </h2>
                    <div id="generos" class="accordion-collapse collapse" data-bs-parent="#detallesAcordeon">
                        <div class="accordion-body">
                            ${(pelicula.generos || 'N/A').split(',').map(g => 
                                `<span class="badge bg-info me-1">${g.trim()}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#actores">
                            Cast
                        </button>
                    </h2>
                    <div id="actores" class="accordion-collapse collapse" data-bs-parent="#detallesAcordeon">
                        <div class="accordion-body">
                            ${pelicula.actores || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-4 d-grid gap-2">
                ${botonWatchlist}
                <button class="btn btn-outline-primary"  
                style="color: #0a748aff !important; border-color: #0d89a2ff !important; 
                background-color: white !important;"
                onclick="loggearPelicula('${pelicula.imdb_id}')">
                    <i class="bi bi-eye"></i> Log a Review
                </button>
            </div>
        </div>
    `;
}