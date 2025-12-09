
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

export function obtenerPosterSeguro(poster) {
    if (!poster || poster === 'N/A' || poster.includes('http://')) {
        return 'https://via.placeholder.com/50x75?text=No+Poster';
    }
    return poster;
}