const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// rutas
const vistasRoutes = require('./routes/vistas.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const busquedaOMDBRoutes = require('./routes/busquedaOMBD.routes');

// middleware
app.use(cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"]
}));

//body parser para body de post
app.use(express.json());


app.use(express.json());
// rutas para endpoints de vistas, watchlist y busqueda con OMDB
app.use('/api/mis-pelis', vistasRoutes);
app.use('/api/mis-pelis', watchlistRoutes);
app.use('/api', busquedaOMDBRoutes);


//Endpoint base
// busqueda con 1 o 2 letras suele devolver vacio por demasiados resultados 
// valores de filtro ordenar_por: titulo - anio - rating_personal - fecha_visto
// valores de ordenamiento orden: asc - desc
app.get('/', (req, res) => {
    res.json({
    titulo: "🎬 Herbert Flix 🎬",
    busqueda_de_peliculas: {
        buscar_pelis_texto: 'GET /api/busqueda/?q=<texto > 2 char>',
        ver_detalles_de_pelicula: 'GET /api/pelicula/:imdb_id'},
    visualizaciones_de_peliculas: { 
        ver_todas_las_pelis: 'GET /api/mis-pelis/vistas',
        buscar_por_texto_orden: 'GET /api/mis-pelis/vistas?q=<texto>&ordenar_por=<valor>&orden=<asc-desc>',
        buscar_peli_por_id: 'GET /api/mis-pelis/vistas/:id',
        agregar_peli: 'POST /api/mis-pelis/vistas',
        eliminar_visualizaciones_peli: 'DELETE /api/mis-pelis/des-ver/:imdb_id'},
    watchlist: {
        ver_watchlist: 'GET /api/mis-pelis/watchlist',
        buscar_por_texto: 'GET /api/mis-pelis/watchlist?q=<texto>',
        agregar_a_watchlist: 'POST /api/mis-pelis/watchlist',
        eliminar_de_watchlist: 'DELETE /api/mis-pelis/watchlist/:imdb_id'}
    });
});


// INICIO ------------------------------

app.listen(PORT, () => { 
    console.log(`Corriendo en http://localhost:${PORT}`);
});