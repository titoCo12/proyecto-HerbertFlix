const axios = require('axios');
const OMDB_API_KEY = 'e29a1fcc'
const OMDB_URL = 'http://www.omdbapi.com/';


//resultado de pelis listadas
async function buscarPelisOMDB(texto) {
    try {
        console.log("Realizando busqueda..")

        const pedido = await axios.get(OMDB_URL, {
            params: {
                apikey: OMDB_API_KEY,     //parametro obligatorio
                s: texto,
                type: 'movie',
                page: 1
            }
        });

        if (pedido.data.Response === 'True') {
            const resultados = pedido.data.Search;
            
            return resultados.map(p => ({
                imbd_id: p.imdbID,
                titulo: p.Title,
                anio: p.Year,
                poster: p.Poster
            }));
        }
        else {
            console.log("Sin resultados");
            return [];
        }

    } catch (error) {
        console.error('Error en busqueda en OMDb:', error.message);
        throw new Error('Error en busqueda:' + error.message);
    }
}


//informacion mas detallada al elegir peli listada
async function obtenerDetallesPeli(imdb_id) {
    try {
        console.log(`abriendo peli seleccionada ${imdb_id}`);
        
        const pedido = await axios.get(OMDB_URL, {
            params: {
                apikey: OMDB_API_KEY,
                i: imdb_id,           //busqueda especifica id
                plot: 'short'         //descripcion corta
            }
        });

        if (pedido.data.Response === 'True') {
            const resultado = pedido.data;

            return {
                imdb_id: resultado.imdbID,
                titulo: resultado.Title,
                anio: resultado.Year || "",
                duracion_minutos: parseInt(resultado.Runtime) || 0,
                director: resultado.Director || "",
                generos: resultado.Genre || "",
                rating_imdb: parseFloat(resultado.imdbRating) || 0,
                sinopsis: resultado.Plot || "",
                poster: resultado.Poster !== "N/A" ? resultado.Poster : null,
                actores: resultado.Actors || "",
                pais: resultado.Country || "",
                idioma: resultado.Language || ""
            };
        } else {
            console.log('Pelicula no encontrada en OMDb');
            return null;
        }
        
    } catch (error) {
        console.error('Error abriendo pelicula:', error.message);
        throw new Error('Error abriendo la pelicula');
    }
}

module.exports = {
    buscarPelisOMDB,
    obtenerDetallesPeli
};