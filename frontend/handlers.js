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


export async function cargarLogs(ordenarPor = 'titulo', orden = 'asc', textoBusqueda = '') {
    const columna = document.getElementById('columna-izquierda');
    mostrarSpinner(columna);

    try {
        // armar URL con parámetros
        let url = `${API_BASE}/api/mis-pelis/vistas`;
        const params = new URLSearchParams();
        
        if (textoBusqueda.trim()) {
            params.append('q', textoBusqueda.trim());
        }
        
        params.append('ordenar_por', ordenarPor);
        params.append('orden', orden);
        
        url += `?${params.toString()}`;

        const r = await fetch(url, { cache: "no-store" });
        const { resultados = 0, visualizaciones = [] } = await r.json();

        if (resultados === 0) {
            columna.innerHTML = `
                <div class="p-4 text-center">
                    <h5>No movie logged yet</h5>
                    ${textoBusqueda.trim() ? `<p class="text-muted">No results for "${textoBusqueda}"</p>` : ''}
                </div>`;
            return;
        }

        // Header con controles
        const headerHTML = `
            <div class="p-3 border-bottom">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="mb-0">Logged movies <small class="text-muted">(${resultados})</small></h4>
                    <div class="d-flex align-items-center">
                        <span class="me-2 small">Order by:</span>
                        <select class="form-select form-select-sm me-2" style="width: auto;" 
                                onchange="cambiarOrdenLogs(this.value, '${orden}')">
                            <option value="titulo" ${ordenarPor === 'titulo' ? 'selected' : ''}>Title</option>
                            <option value="anio" ${ordenarPor === 'anio' ? 'selected' : ''}>Year</option>
                            <option value="rating_personal" ${ordenarPor === 'rating_personal' ? 'selected' : ''}>Personal rating</option>
                            <option value="fecha_visto" ${ordenarPor === 'fecha_visto' ? 'selected' : ''}>Date seen</option>
                        </select>
                        <button class="btn btn-sm btn-outline-secondary" 
                                onclick="alternarOrdenLogs('${ordenarPor}', '${orden}')">
                            ${orden === 'asc' ? 
                              '<i class="bi bi-sort-down"></i>' : 
                              '<i class="bi bi-sort-up"></i>'}
                        </button>
                    </div>
                </div>
                <div class="mb-2">
                    <input type="text" 
                           class="form-control form-control-sm" 
                           placeholder="Search in logs..." 
                           id="busquedaLogs"
                           value="${textoBusqueda}"
                           onkeyup="buscarEnLogs(this.value)">
                </div>
            </div>
        `;

        // generar lista de logs (ya vienen filtrados y ordenados por mi api)
        const pelis = visualizaciones.map(p => {
            return `
                <div class="peli-listada p-3 border-bottom" 
                     onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})">
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

        columna.innerHTML = headerHTML + `
            <div style="max-height: calc(100vh - 120px); overflow-y: auto;">
                ${pelis}
            </div>
        `;

    } catch (e) {
        console.error('Error loading logs:', e);
        columna.innerHTML = `<div class="alert alert-danger m-3">Error loading logs</div>`;
    }
}


window.cambiarOrdenLogs = function(ordenarPor) {
    const busquedaInput = document.getElementById('busquedaLogs');
    const textoBusqueda = busquedaInput ? busquedaInput.value : '';
    cargarLogs(ordenarPor, 'asc', textoBusqueda);
};


window.buscarEnLogs = function(texto) {
    clearTimeout(window.busquedaTimeout);
    window.busquedaTimeout = setTimeout(() => {
        const select = document.querySelector('#columna-izquierda select');
        const ordenarPor = select ? select.value : 'titulo';
        cargarLogs(ordenarPor, 'asc', texto);
    }, 300);
};


window.alternarOrdenLogs = function(ordenarPor, ordenActual) {
    const nuevoOrden = ordenActual === 'asc' ? 'desc' : 'asc';
    const busquedaInput = document.getElementById('busquedaLogs');
    const textoBusqueda = busquedaInput ? busquedaInput.value : '';
    cargarLogs(ordenarPor, nuevoOrden, textoBusqueda);
};


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
    
    const esLog = pelicula.rating_personal !== undefined || 
                  pelicula.resenia !== undefined || 
                  pelicula.fecha_visto !== undefined;
    
    if (esLog) {
        // Es un log, mostrar directamente
        renderizarDetalles(pelicula, true);
        return;
    }

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
    
    //obtener detalles de la película primero
    fetch(`${API_BASE}/api/pelicula/${imdb_id}`)
        .then(res => res.json())
        .then(data => {
            const pelicula = data.peli;
            if (!pelicula) throw new Error("No se pudieron obtener detalles");
            
            mostrarModalLog(pelicula);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading movie details');
        });
}

function mostrarModalLog(pelicula) {
    const modalHTML = `
        <div class="modal fade" id="modalLogPelicula" tabindex="-1" aria-labelledby="modalLogLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalLogLabel">
                            <i class="bi bi-journal-plus"></i> Log "${pelicula.titulo}"
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Rating personal -->
                        <div class="mb-3">
                            <label for="ratingPersonal" class="form-label">
                                Your Rating (0-10)
                            </label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1 me-3" 
                                       id="ratingPersonal" min="0" max="10" step="0.5" value="5">
                                <span id="ratingValue" class="badge bg-warning fs-6">5.0</span>
                            </div>
                            <div class="text-muted small mt-1">
                                <span>0</span>
                                <span class="float-end">10</span>
                            </div>
                        </div>
                        
                        <!-- Reseña -->
                        <div class="mb-3">
                            <label for="reseniaText" class="form-label">
                                Review (optional)
                            </label>
                            <textarea class="form-control" id="reseniaText" 
                                      rows="4" placeholder="What did you think of this movie?"></textarea>
                        </div>
                        
                        <!-- Fecha visto (opcional) -->
                        <div class="mb-3">
                            <label for="fechaVisto" class="form-label">
                                Watched Date (optional)
                            </label>
                            <input type="date" class="form-control" id="fechaVisto" 
                                   value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        style="color: #dc3545 !important; border-color: #dc3545 !important; 
                        background-color: white !important;">
                            <i class="bi bi-x-circle"></i> Cancel
                        </button>
                        <button type="button" class="btn btn-primary" 
                        onclick="enviarLog('${pelicula.imdb_id}')"
                        style="color: #0a748aff !important; border-color: #0d89a2ff !important; 
                        background-color: white !important;">
                            <i class="bi bi-check-circle"></i> Save Log
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById('modalLogPelicula'));
        modal.show();
        
        const ratingInput = document.getElementById('ratingPersonal');
        const ratingValue = document.getElementById('ratingValue');
        
        ratingInput.addEventListener('input', function() {
            ratingValue.textContent = parseFloat(this.value).toFixed(1);
        });
        
        document.getElementById('modalLogPelicula').addEventListener('hidden.bs.modal', function() {
            modalContainer.remove();
        });
    }, 100);
}


window.enviarLog = async function(imdb_id) {
    try {
        const rating = parseFloat(document.getElementById('ratingPersonal').value);
        const resenia = document.getElementById('reseniaText').value.trim();
        const fechaVisto = document.getElementById('fechaVisto').value;
        
        if (isNaN(rating) || rating < 0 || rating > 10) {
            alert('Please enter a valid rating between 0 and 10');
            return;
        }
        // obtener detalles completos de la película desde OMDB
        const respuestaDetalles = await fetch(`${API_BASE}/api/pelicula/${imdb_id}`);
        const resultadoDetalles = await respuestaDetalles.json();
        const pelicula = resultadoDetalles.peli;
        
        if (!pelicula) {
            throw new Error("Couldn't get movie details");
        }
        
        // enviar log con datos necesarios
        const respuesta = await fetch(`${API_BASE}/api/mis-pelis/vistas`, {
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
                poster: pelicula.poster,
                rating_personal: rating,
                resenia: resenia || '',
                fecha_visto: fechaVisto || new Date().toISOString().split('T')[0]
            })
        });
        
        const resultado = await respuesta.json();
        
        if (respuesta.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalLogPelicula'));
            modal.hide();
            
            alert('Movie logged successfully');
            
            if (document.querySelector('#columna-izquierda h4')?.textContent.includes('Logged movies')) {
                setTimeout(() => cargarLogs(), 300);
            }
        } else {
            alert(`Error: ${resultado.error || 'Failed to save log'}`);
        }
        
    } catch (error) {
        console.error('Error saving log:', error);
        alert('Network error');
    }
};


export async function eliminarLog(id) {
    if (!confirm('Are you sure you want to delete this log?')) return;
    
    console.log('Intentando eliminar log con ID:', id);
    console.log('Tipo de ID:', typeof id);
    console.log('URL:', `${API_BASE}/api/mis-pelis/vistas/${id}`);

    try {
        const respuesta = await fetch(`${API_BASE}/api/mis-pelis/vistas/${id}`, {
            method: 'DELETE'
        });
        
        if (respuesta.ok) {
            const resultado = await respuesta.json();
            
            // refrescar logs
            if (document.querySelector('#columna-izquierda h4')?.textContent.includes('Logged movies')) {
                setTimeout(() => cargarLogs(), 300);
            }
            
            // volver a estado inicial
            const columnaDerecha = document.getElementById('columna-derecha');
            columnaDerecha.innerHTML = `
                <div class="text-center py-5">
                    <div class="text-muted mb-3">
                        <h4>Select a movie to see details</h4>
                        <i class="bi bi-film display-1"></i>
                    </div>
                </div>
            `;
            
        } else {
            const resultado = await respuesta.json();
            alert(`Error: ${resultado.error || 'Failed to delete log'}`);
        }
        
    } catch (error) {
        console.error('Error deleting log:', error);
        alert('Network error');
    }
}


