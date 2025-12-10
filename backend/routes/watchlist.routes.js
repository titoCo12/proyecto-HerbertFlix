const express = require('express');
const router = express.Router();
const { 
    leerPelis, 
    guardarDatos, 
    agregarRegistro, 
    busquedaDePelis } = require('../helpers/pelis.helpers');


router.get('/watchlist/:imdb_id', (req, res) => {
    try {
        const imdb_id = req.params.imdb_id;
        const peli = leerPelis('watchlist').find(p => p.imdb_id===imdb_id);
        
        if(!peli) {
            res.json ({
                existe: false,
                peli: null
            })
        }
        else {
            res.json ({
                existe: true,
                peli: peli
            })
        }

    } catch (error) {
        console.error('Error en GET /api/mis-pelis/watchlist/:imdb_id', error.message);
        res.status(500).json({ error: error.message });
    }
});

//Endpoint buscar pelis en watchlist
router.get('/watchlist', (req, res) => {
    try {
        const {q:texto} = req.query;
        //la watchlist se carga en el front en orden alfabetico
        const pelis = busquedaDePelis(leerPelis('watchlist'), texto, 'titulo', null);
        
        res.json({
            mensaje: 'Watchlist',
            busqueda: texto,
            total: pelis.length,
            watchlist: pelis
        });
        
    } catch (error) {
        console.error('Error en GET /api/mis-pelis/watchlist:', error.message);
        res.status(500).json({ error: error.message });
    }
});


//Endpoint agregar a watchlist
router.post('/watchlist', (req, res) => {
    try {
        const datos = req.body;
        
        if (!datos.imdb_id) {throw new Error('Falta imdb_id');}
        
        let watchlist = leerPelis('watchlist');
        
        // evitar duplicados
        if (watchlist.some(p => p.imdb_id === datos.imdb_id)) {
            return res.status(400).json({ 
                error: 'pelicula ya está en watchlist',
                imdb_id: datos.imdb_id});
        }
        
        const nuevaPeliWatchlist = {
            imdb_id: datos.imdb_id,
            titulo: datos.titulo,
            anio: datos.anio,
            duracion_minutos: datos.duracion_minutos,
            director: datos.director,
            generos: datos.generos,
            rating_imdb: datos.rating_imdb,
            poster: datos.poster
        };
        
        agregarRegistro(nuevaPeliWatchlist, 'watchlist');
        
        res.status(201).json({
            mensaje: 'pelicula agregada a watchlist',
            item: nuevaPeliWatchlist
        });
        
    } catch (error) {
        console.error('Error en POST /api/mis-pelis/watchlist:', error.message);
        res.status(400).json({ error: error.message });
    }
});


//Endpoint sacar peli de watchlist
router.delete('/watchlist/:imdb_id', (req, res) => {
    try {
        const imdb_id = req.params.imdb_id;
        let watchlist = leerPelis('watchlist');
        const peliASacar = watchlist.find(p => p.imdb_id == imdb_id);
        
        if (!peliASacar) {
            return res.status(404).json({ 
                error: 'pelicula no encontrada en watchlist',
                imdb_id: imdb_id
            });
        } 

        guardarDatos(watchlist.filter(p => p.imdb_id !== imdb_id), 'watchlist');
        
        res.json({
            mensaje: 'pelicula eliminada de watchlist',
            titulo_eliminado: peliASacar.titulo,
            imdb_id: imdb_id
        });
        
    } catch (error) {
        console.error('Error en DELETE /api/mis-pelis/watchlist/:imdb_id:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;