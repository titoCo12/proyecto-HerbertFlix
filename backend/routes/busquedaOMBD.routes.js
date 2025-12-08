const express = require('express');
const router = express.Router();
const {buscarPelisOMDB, obtenerDetallesPeli} = require('../helpers/omdb.helper');


//busqueda de peliculas atraves de la api OMDB
router.get('/busqueda', async (req, res) => {
    try {
        const {q:texto} = req.query;
        const txt = texto.trim();

        if (txt.trim() === '') {
            return res.status(400).json({
                error: 'Ingresa texto para buscar'
            });
        }
        
        const resultados = await buscarPelisOMDB(txt);
        
        res.json({
            mensaje: `Resultados de "${txt}"`,
            resultados: resultados
        });
        
    } catch (error) {
        console.error('Error en GET /api/busqueda:', error.message);
        res.status(500).json({ 
            error: 'Error en busqueda de pelis',
            detalle: error.message 
        });
    }
});

//detalles de pelicula 
router.get('/pelicula/:imdb_id', async (req, res) => {
    try {
        const imdb_id = req.params.imdb_id;
        
        // formato imdb_id
        if (!imdb_id.startsWith('tt')) {
            return res.status(400).json({
                error: 'ID de película inválido',
            });
        }
        
        const detalles = await obtenerDetallesPeli(imdb_id);
        
        if (!detalles) {
            return res.status(404).json({
                error: 'Película no encontrada',
                id_buscado: imdb_id
            });
        }
        
        res.json({
            mensaje: 'Detalles de película',
            peli: detalles
        });
        
    } catch (error) {
        console.error('Error en GET /api/peliculas/:imdb_id:', error.message);
        res.status(500).json({ 
            error: 'Error al obtener detalles',
            detalle: error.message 
        });
    }
});

module.exports = router;