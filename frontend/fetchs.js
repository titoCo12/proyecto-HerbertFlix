const API_BASE = 'http://localhost:3000';

export async function fetchWatchlist() {
    const r = await fetch(`${API_BASE}/api/mis-pelis/watchlist`, { cache: "no-store" });
    return await r.json();
}

export async function fetchLogs() {
    const r = await fetch(`${API_BASE}/api/mis-pelis/vistas`, { cache: "no-store" });
    return await r.json();
}

export async function fetchBusqueda(query) {
    const r = await fetch(`${API_BASE}/api/buscar?titulo=${encodeURIComponent(query)}`);
    return await r.json();
}