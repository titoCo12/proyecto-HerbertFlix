// app.js - Punto de entrada
import { 
    cargarWatchlist, 
    cargarLogs, 
    buscarOMDB, 
    seleccionarPelicula, 
    agregarAWatchlist, 
    removerDeWatchlist, 
    loggearPelicula,
} from './handlers.js';

// Exportar funciones al scope global para HTML
window.cargarWatchlist = cargarWatchlist;
window.cargarLogs = cargarLogs;
window.buscarOMDB = buscarOMDB;
window.seleccionarPelicula = seleccionarPelicula;
window.agregarAWatchlist = agregarAWatchlist;
window.removerDeWatchlist = removerDeWatchlist;
window.loggearPelicula = loggearPelicula;

console.log('app cargada');