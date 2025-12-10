// app.js - Punto de entrada
import { 
    cargarWatchlist, 
    cargarLogs, 
    buscarOMDB, 
    seleccionarPelicula, 
    agregarAWatchlist, 
    removerDeWatchlist, 
    loggearPelicula,
    eliminarLog
} from './handlers.js';

// Exportar funciones al scope global para HTML
window.cargarWatchlist = cargarWatchlist;
window.cargarLogs = cargarLogs;
window.buscarOMDB = buscarOMDB;
window.seleccionarPelicula = seleccionarPelicula;
window.agregarAWatchlist = agregarAWatchlist;
window.removerDeWatchlist = removerDeWatchlist;
window.loggearPelicula = loggearPelicula;
window.eliminarLog = eliminarLog;
window.cambiarOrdenLogs = cambiarOrdenLogs;
window.buscarEnLogs = buscarEnLogs;

console.log('app cargada');