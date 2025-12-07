
const express = require('express');
const app = express();
const PORT = 3000;

// Importar rutas
const vistasRoutes = require('./routes/vistas.routes');
const watchlistRoutes = require('./routes/watchlist.routes');

// middleware
app.use(express.json());
// rutas para endpoints de vistas y watchlist
app.use('/api/mis-pelis', vistasRoutes);
app.use('/api/mis-pelis', watchlistRoutes);



//Endpoint base 
// valores de filtro ordenar_por: anio - rating_personal - fecha_visto
// valores de ordenamiento orden: asc - desc
app.get('/', (req, res) => {
    res.json({
    titulo: "🎬 Herbert Flix 🎬",
    endpoints_de_visualizaciones: { 
        ver_todas_las_pelis: 'GET /api/mis-pelis/vistas',
        buscar_por_texto_orden: 'GET /api/mis-pelis/vistas?q=<texto>&ordenar_por=<valor>&orden=<asc-desc>',
        buscar_peli_por_id: 'GET /api/mis-pelis/vistas/:id',
        agregar_peli: 'POST /api/mis-pelis/vistas',
        eliminar_visualizaciones_peli: 'DELETE /api/mis-pelis/des-ver/:imdb_id'},
    endpoints_de_watchlist: {
        ver_watchlist: 'GET /api/mis-pelis/watchlist',
        buscar_por_texto: 'GET /api/mis-pelis/watchlist?q=<texto>',
        agregar_a_watchlist: 'POST /api/mis-pelis/watchlist',
        eliminar_de_watchlist: 'DELETE /api/mis-pelis/watchlist/:imdb_id'
    }
    });
});


// INICIO ------------------------------

app.listen(PORT, () => { 
    console.log(`Corriendo en http://localhost:${PORT}`);
});