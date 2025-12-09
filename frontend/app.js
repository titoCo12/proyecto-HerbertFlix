const API_BASE = 'http://localhost:3000';

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


//Al tocar Watchlist
async function cargarWatchlist() {
    const columna = document.getElementById('columna-izquierda');
    mostrarSpinner(columna);

    try {
        const r = await fetch(`${API_BASE}/api/mis-pelis/watchlist`, { cache: "no-store" });
        const { watchlist = [] } = await r.json();

        if (watchlist.length === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>Watchlist vacía</h5></div>`;
            return;
        }

        const pelis = watchlist.map(p => `
            <div class="peli-listada p-3 border-bottom" 
                onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                <div class="d-flex">
                    <img src="${p.poster || 'https://via.placeholder.com/50x75'}"
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
async function cargarLogs() {
    const columna = document.getElementById('columna-izquierda');
    mostrarSpinner(columna);

    try {
        const r = await fetch(`${API_BASE}/api/mis-pelis/vistas`, { cache: "no-store" });
        const { resultados = 0, visualizaciones = [] } = await r.json();

        if (resultados === 0) {
            columna.innerHTML = `<div class="p-4 text-center"><h5>No hay logs</h5></div>`;
            return;
        }

        const pelis = visualizaciones.map(p => {
            return `
                <div class="peli-listada p-3 border-bottom" 
                    onclick="seleccionarPelicula(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                    <div class="d-flex">
                        <img src="${p.poster || 'https://via.placeholder.com/50x75'}"
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




function seleccionarPelicula(pelicula) {
    console.log('Seleccionada:', pelicula);
    // Para la columna derecha después
}