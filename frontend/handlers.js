import { fetchWatchlist, fetchLogs, fetchBusqueda } from './api.js';
import { mostrarSpinner, renderizarLista, obtenerPosterSeguro } from './render.js';

//Al tocar Watchlist
export async function cargarWatchlist() {
    const columna = document.getElementById('columna-izquierda');
    mostrarSpinner(columna);

    try {
        const {watchlist = []} = await fetchWatchlist();

        if (watchlist.length === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>Watchlist vacía</h5></div>`;
            return;
        }

        const pelis = watchlist.map(p => `
            <div class="peli-listada p-3 border-bottom" 
                onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <div class="d-flex">
                    <img src="${obtenerPosterSeguro(p.poster)}"
                        style="width:50px;height:75px;object-fit:cover;border-radius:4px;">
                    <div class="ms-3">
                        <h6 class="mb-1">${p.titulo || 'Sin título'}</h6>
                        <p class="mb-1 small text-muted">${p.director || 'Director desconocido'}</p>
                        <span class="badge bg-secondary">${p.anio || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `).join('');

        renderizarLista(columna, "Watchlist", watchlist.length, pelis);

    } catch (e) {
        columna.innerHTML = `<div class="alert alert-danger m-3">Error</div>`;
    }
}

//Al tocar Logs
export async function cargarLogs() {
    const columna = document.getElementById('columna-izquierda');
    mostrarSpinner(columna);

    try {
        const {resultados = 0, visualizaciones = []} = await fetchLogs();

        if (resultados === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>No hay logs</h5></div>`;
            return;
        }

        const pelis = visualizaciones.map(p => {
            return `
                <div class="peli-listada p-3 border-bottom" 
                    onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                    <div class="d-flex">
                        <img src="${obtenerPosterSeguro(p.poster)}"
                            style="width:50px;height:75px;object-fit:cover;border-radius:4px;">
                        <div class="ms-3 w-100">
                            <div class="d-flex justify-content-between">
                                <h6 class="mb-1">${p.titulo || 'Sin título'}</h6>
                                <span class="badge bg-warning">★ ${p.rating_personal || 0}</span>
                            </div>
                            <p class="mb-1 small text-muted">
                                ${p.director || 'Director desconocido'} • 
                                <span class="badge bg-secondary">${p.anio || 'N/A'}</span>
                            </p>
                            <p class="mb-1 small">${(p.resenia || '').slice(0, 80)}${(p.resenia || '').length > 80 ? '...' : ''}</p>
                            <p class="mb-0 small text-muted"><i class="bi bi-calendar"></i> ${p.fecha_visto || 'Sin fecha'}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        renderizarLista(columna, "Logged movies", resultados, pelis);

    } catch (e) {
        columna.innerHTML = `<div class="alert alert-danger m-3">Error</div>`;
    }
}


//Al buscar por OMDB
export async function buscarOMDB(texto) {
    const columna = document.getElementById('columna-izquierda');
    
    if (!texto) {
        alert('Escribe algo para buscar');
        return;
    }
    
    mostrarSpinner(columna);
    
    try {
        const data = await fetchBusqueda(texto);
        const peliculas = data.resultados || [];
        
        if (peliculas.length === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>No se encontraron películas</h5></div>`;
            return;
        }
        
        const pelis = peliculas.map(p => `
            <div class="peli-listada p-3 border-bottom" 
                 onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <div class="d-flex">
                    <img src="${obtenerPosterSeguro(p.poster)}"
                         style="width:50px;height:75px;object-fit:cover;border-radius:4px;">
                    <div class="ms-3">
                        <h6 class="mb-1">${p.titulo || 'Sin título'}</h6>
                        <p class="mb-1 small text-muted">${p.anio || 'N/A'}</p>
                        <span class="badge bg-info">'movie'</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        renderizarLista(columna, `Results for "${texto}"`, peliculas.length, pelis);
        
    } catch (e) {
        columna.innerHTML = `<div class="alert alert-danger m-3">Error: ${e.message}</div>`;
    }
}

