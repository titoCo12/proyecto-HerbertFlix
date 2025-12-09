// handlers.js
import { mostrarSpinner, renderizarLista, obtenerPosterSeguro, renderizarDetalles } from './renders.js';

const API_BASE = 'http://localhost:3000';

export async function cargarWatchlist() {
    const columna = document.getElementById('columna-izquierda');
    mostrarSpinner(columna);

    try {
        const r = await fetch(`${API_BASE}/api/mis-pelis/watchlist`, { cache: "no-store" });
        const { watchlist = [] } = await r.json();

        if (watchlist.length === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>Your watchlist is empty, Good for you!</h5></div>`;
            return;
        }

        const pelis = watchlist.map(p => `
            <div class="peli-listada p-3 border-bottom" 
                onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <div class="d-flex">
                    <img src="${obtenerPosterSeguro(p.poster)}"
                        style="width:50px;height:75px;object-fit:cover;border-radius:4px;">
                    <div class="ms-3">
                        <h6 class="mb-1">${p.titulo || '<Missing title>'}</h6>
                        <p class="mb-1 small text-muted">${p.director || 'Unknown director'}</p>
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

export async function cargarLogs() {
    const columna = document.getElementById('columna-izquierda');
    mostrarSpinner(columna);

    try {
        const r = await fetch(`${API_BASE}/api/mis-pelis/vistas`, { cache: "no-store" });
        const { resultados = 0, visualizaciones = [] } = await r.json();

        if (resultados === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>No movie logged yet</h5></div>`;
            return;
        }

        const pelis = visualizaciones.map(p => {
            return `
                <div class="peli-listada p-3 border-bottom">
                    <div class="d-flex">
                        <img src="${obtenerPosterSeguro(p.poster)}"
                            style="width:50px;height:75px;object-fit:cover;border-radius:4px;">
                        <div class="ms-3 w-100">
                            <div class="d-flex justify-content-between">
                                <h6 class="mb-1">${p.titulo || '<Missing title>'}</h6>
                                <span class="badge bg-warning">★ ${p.rating_personal || 0}</span>
                            </div>
                            <p class="mb-1 small text-muted">
                                ${p.director || 'Unknown director'} • 
                                <span class="badge bg-secondary">${p.anio || 'N/A'}</span>
                            </p>
                            <p class="mb-1 small">${(p.resenia || '').slice(0, 80)}${(p.resenia || '').length > 80 ? '...' : ''}</p>
                            <p class="mb-0 small text-muted"><i class="bi bi-calendar"></i> ${p.fecha_visto || ''}</p>
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

export async function buscarOMDB(texto, pag = 1) {
    const columna = document.getElementById('columna-izquierda');
    
    if (texto.length <= 2) {
        columna.innerHTML = `<div class="p-4 text-center"><h5>Write 3 or more letters to search</h5></div>`;
        return;
    }
    
    mostrarSpinner(columna);
    
    try {
        const r = await fetch(`${API_BASE}/api/busqueda?q=${encodeURIComponent(texto)}&page=${pag}`);
        const data = await r.json();
        const peliculas = data.resultados || [];
        const cantPaginas = data.cantPaginas;

        if (peliculas.length === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>No titles found :(</h5></div>`;
            return;
        }
        
        const pelis = peliculas.map(p => `
            <div class="peli-listada p-3 border-bottom" 
                 onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <div class="d-flex">
                    <img src="${obtenerPosterSeguro(p.poster)}"
                         style="width:50px;height:75px;object-fit:cover;border-radius:4px;">
                    <div class="ms-3">
                        <h6 class="mb-1">${p.titulo || '<Missing title>'}</h6>
                        <p class="mb-1 small text-muted">${p.anio || 'N/A'}</p>
                    </div>
                </div>
            </div>
        `).join('');

        const paginacion = `
            <div class="p-3 border-top d-flex justify-content-center align-items-center">
                ${pag > 1 ? `
                    <button class="btn btn-outline-primary btn-sm me-2" 
                            onclick="buscarOMDB('${texto}', ${pag - 1})">
                        <i class="bi bi-chevron-left"></i> Previous
                    </button>
                ` : ''}
                
                <span class="mx-2 text-muted">Page ${pag}</span>
                
                ${cantPaginas > pag ? `
                    <button class="btn btn-outline-primary btn-sm ms-2" 
                            onclick="buscarOMDB('${texto}', ${pag + 1})">
                        Next <i class="bi bi-chevron-right"></i>
                    </button>
                ` : ''}
            </div>
        `;

        renderizarLista(columna, `Results for "${texto}"`, data.total, pelis + paginacion);

    } catch (e) {
        columna.innerHTML = `<div class="alert alert-danger m-3">Error: ${e.message}</div>`;
    }
}

export async function seleccionarPelicula(pelicula) {
    console.log('Seleccionada:', pelicula);
    
    const columnaDerecha = document.getElementById('columna-derecha');
    if (!columnaDerecha) return;
    
    columnaDerecha.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border"></div>
            <p class="mt-2">Loading movie details...</p>
        </div>
    `;
    
    try {
        const imdbID = pelicula.imdb_id;
        if (!imdbID) {
            throw new Error('Movie does not have an ID');
        }
        
        const respuesta = await fetch(`${API_BASE}/api/pelicula/${imdbID}`);
        const resultado = await respuesta.json();
        const detalles = resultado.peli;
        
        renderizarDetalles(detalles);
        
    } catch (error) {
        console.error('Error loading movie details:', error);
        columnaDerecha.innerHTML = `
            <div class="alert alert-danger m-3">
                Error loading movie details: ${error.message}
            </div>
        `;
    }
}

export async function agregarAWatchlist(imdb_id) {
    try {
        const respuestaDetalles = await fetch(`${API_BASE}/api/pelicula/${imdb_id}`);
        const resultadoDetalles = await respuestaDetalles.json();
        const pelicula = resultadoDetalles.peli;

        if (!pelicula) throw new Error("Couldn't access movie details");

        const respuesta = await fetch(`${API_BASE}/api/mis-pelis/watchlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imdb_id: pelicula.imdb_id,
                titulo: pelicula.titulo,
                anio: pelicula.anio,
                duracion_minutos: pelicula.duracion_minutos,
                director: pelicula.director,
                generos: pelicula.generos,
                rating_imdb: pelicula.rating_imdb,
                poster: pelicula.poster
            })
        });
        
        const resultado = await respuesta.json();
        
        if (respuesta.ok) {
            if (document.querySelector('#columna-izquierda h4')?.textContent.includes('Watchlist')) {
                cargarWatchlist();
            }
        } else {
            alert(`Error: ${resultado.error || 'Failed to add'}`);
        }
        
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        alert('Network error');
    }
}

export async function removerDeWatchlist(imdb_id) {
    if (!confirm('Remove from watchlist?')) return;
    
    try {
        const respuesta = await fetch(`${API_BASE}/api/mis-pelis/watchlist/${imdb_id}`, {
            method: 'DELETE'
        });
        
        if (respuesta.ok) {
            if (document.querySelector('#columna-izquierda h4')?.textContent.includes('Watchlist')) {
                cargarWatchlist();
            }
        } else {
            const resultado = await respuesta.json();
            alert(`Error: ${resultado.error || 'Failed to remove'}`);
        }
        
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        alert('Network error');
    }
}

export function loggearPelicula(imdb_id) {
    console.log('Log movie:', imdb_id);
    // TODO: Implementar
}