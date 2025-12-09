const API_BASE = 'http://localhost:3000';

// RENDER ------------------------------

function obtenerPosterSeguro(poster) {
    if (!poster || 
        poster === 'N/A' || poster === null) {
        return 'https://via.placeholder.com/50x75?text=No+Poster';
    }
    // roxy para bloqueo de Amazon
    if (poster.includes('amazon.com') || poster.includes('amazonaws.com')) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(poster)}&w=300`;
    }
    return poster;
}

function mostrarSpinner(columna) {
    columna.innerHTML = `<div class="text-center p-5"><div class="spinner-border"></div></div>`;
}

function renderizarLista(columna, titulo, cantidad, itemsHtml) {
    columna.innerHTML = `
        <div class="p-3 border-bottom">
            <h4>${titulo} <small class="text-muted">(${cantidad})</small></h4>
        </div>
        <div style="max-height: calc(100vh - 120px); overflow-y: auto;">
            ${itemsHtml}
        </div>
    `;
}

//detalles hechos por ia
function renderizarDetalles(pelicula) {
    const columnaDerecha = document.getElementById('columna-derecha');
    
    const posterUrl = obtenerPosterSeguro(pelicula.poster);
    const posterGrande = posterUrl.replace('SX300', 'SX600').replace('300', '500');
    
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
            
            <!-- Acordeón Bootstrap -->
            <div class="accordion" id="detallesAcordeon">
                <!-- Sinopsis -->
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
                
                <!-- Géneros -->
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
                
                <!-- Actores -->
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
            
            <!-- Botones de acción -->
            <div class="mt-4 d-grid gap-2">
                <button class="btn btn-success" onclick="agregarAWatchlist('${pelicula.imdb_id}')">
                    <i class="bi bi-plus-circle"></i> Add to Watchlist
                </button>
                <button class="btn btn-primary" onclick="loggearPelicula('${pelicula.imdb_id}')">
                    <i class="bi bi-eye"></i> Log a Review
                </button>
            </div>
        </div>
    `;
}


// HANDLERS ----------------------------

//Al tocar Watchlist
async function cargarWatchlist() {
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

//Al tocar Logs
async function cargarLogs() {
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


//Al buscar por OMDB
async function buscarOMDB(texto, pag = 1) {   //primer pagina por default
    const columna = document.getElementById('columna-izquierda');
    
    if (texto.length <= 2) {
        columna.innerHTML = `<div class="p-4 text-center"><h5>Write 3 or more letters to search</h5></div>`;
        return;
    }
    
    mostrarSpinner(columna);
    
    //elementos de pag actual
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

        // botones de paginacion abajo
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

        console.log('Total páginas:', cantPaginas, 'Página actual:', pag);
        renderizarLista(columna, `Results for "${texto}"`, data.total, pelis + paginacion);

        
    } catch (e) {
        columna.innerHTML = `<div class="alert alert-danger m-3">Error: ${e.message}</div>`;
    }
}


async function seleccionarPelicula(pelicula) {
    console.log('Seleccionada:', pelicula);
    
    const columnaDerecha = document.getElementById('columna-derecha');
    if (!columnaDerecha) return;
    
    //loading derecha
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
        
        // Renderizar en columna derecha
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
