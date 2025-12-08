const express = require('express');
const router = express.Router();
const { 
    leerPelis, 
    guardarDatos, 
    agregarRegistro, 
    busquedaDePelis 
} = require('../helpers/pelis.helpers');


//Endpoint buscar visualizaciones de pelis
router.get('/vistas', (req, res) => {
    try {
        const {q:texto, ordenar_por, orden} = req.query;
        const pelis = busquedaDePelis(leerPelis('vistas'), texto, ordenar_por, orden);
        
        res.json({
            busqueda: "visualizaciones registradas",
            filtros: { texto, ordenar_por, orden },
            resultados: pelis.length,
            visualizaciones: pelis
        });
        
    } catch (error) {
        console.error('Error en GET /api/mis-pelis/vistas:', error.message);
        res.status(500).json({ error: error.message });
    }
});


//Endpoint peli por id (dev)
router.get('/vistas/:id', (req, res) => {
    try {
        const id = req.params.id;
        const peli = leerPelis('vistas').find(p => p.id == id);
        
        if (!peli) {
            return res.status(404).json({ 
                error: 'visualizacion de peli no encontrada',
                id_buscado: id,
            });
        }
        
        res.json({
            mensaje: 'Visualización encontrada',
            pelicula: peli
        });
        
    } catch (error) {
        console.error('Error en GET /api/mis-pelis/vistas/:id:', error.message);
        res.status(500).json({ error: error.message });
    }
});


//Endpoint agregar 'visualización' de pelicula
router.post('/vistas', (req,res) => {
    try {
        const datos = req.body;
        
        //validaciones
        if (!datos.imdb_id) {
            throw new Error('falta id de imdb');
        }
        else if (datos.rating_personal !== undefined) {
            if (datos.rating_personal < 0 || datos.rating_personal > 10) {
                throw new Error('rating_personal debe estar entre 0 y 10');
            }
        }
        
        const nuevaVisualizacion = {
            id: Date.now(),        //timestamp para los id para evitar repetidos
            imdb_id: datos.imdb_id,
            titulo: datos.titulo,
            anio: datos.anio,
            duracion_minutos: datos.duracion_minutos || 0,  //si omdb no me da duracion el parseInt devuelve NaN
            director: datos.director,
            generos: datos.generos,
            rating_imdb: datos.rating_imdb,
            poster: datos.poster,
            rating_personal: datos.rating_personal !== undefined ? datos.rating_personal : null,
            resenia: datos.resenia || "",
            fecha_visto: new Date().toISOString().split('T')[0]
        };
        
        agregarRegistro(nuevaVisualizacion, 'vistas');

        res.status(201).json({
            mensaje: "peli registrada",
            registro: nuevaVisualizacion
        });

    } catch (error) {
        console.error('Error en POST /api/mis-pelis/vistas:', error.message);
        res.status(500).json({ error: error.message });
    }
    
});


//Endpoint eliminar visualizaciones de una pelicula
router.delete('/des-ver/:imdb_id', (req, res) => {
    try {
        const imdb_id = req.params.imdb_id;
        
        let pelis = leerPelis('vistas');
        const total = pelis.length;
    
        const pelisEliminadas = pelis.filter(p => p.imdb_id === imdb_id);
        const pelisFinal = pelis.filter(p => p.imdb_id !== imdb_id);
        
        // si no se elimino nada no reescribo el json
        if (pelisEliminadas.length == 0) {
            return res.status(404).json({ 
                mensaje: 'no se encontraron regisgtros para eliminar',
                imdb_id: imdb_id
            });
        }
        
        // reescribo
        guardarDatos(pelisFinal, 'vistas');
        
        // Respuesta exitosa
        res.json({
            estado: `se eliminaron registros de la peli ${imdb_id}`,
            titulo: pelisEliminadas[0].titulo,
            detalles: {
                registros_borrados: pelisEliminadas.length,
                restantes: pelisFinal.length,
            }
        });
        
    } catch (error) {
        console.error('Error en DELETE /api/mis-pelis/des-ver/:imdb_id:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;