const axios = require('axios');
const OMDB_API_KEY = 'e29a1fcc'
const OMDB_URL = 'http://www.omdbapi.com/';

//refactor para no repetir tanto
function normalizarTexto(t) {
    if (t === 'N/A' || t === undefined || t === null) {
        return '';
    }
    return t.trim();
}

//resultado de pelis listadas
async function buscarPelisOMDB(texto, pag = 1) {
    try {
        console.log("Realizando busqueda..")

        const pedido = await axios.get(OMDB_URL, {
            params: {
                apikey: OMDB_API_KEY,     
                s: texto,
                type: 'movie',
                page: pag
            }
        });

        if (pedido.data.Response === 'True') {
            const resultados = pedido.data.Search;
            
            return {
                resultados: resultados.map(p => ({
                    imdb_id: p.imdbID,
                    titulo: p.Title,
                    anio: p.Year,
                    poster: p.Poster
                })),
                cantResultados: pedido.data.totalResults
            };

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
                i: imdb_id,           
                plot: 'short'         //descripcion corta
            }
        });

        if (pedido.data.Response === 'True') {
            const resultado = pedido.data;

            return {
                imdb_id: resultado.imdbID,
                titulo: normalizarTexto(resultado.Title),
                anio: normalizarTexto(resultado.Year),
                duracion_minutos: parseInt(resultado.Runtime) || 0,
                director: normalizarTexto(resultado.Director),
                generos: normalizarTexto(resultado.Genre),
                rating_imdb: parseFloat(resultado.imdbRating) || 0,
                sinopsis: normalizarTexto(resultado.Plot),
                poster: resultado.Poster !== "N/A" ? resultado.Poster : "N/A",
                actores: normalizarTexto(resultado.Actors),
                pais: normalizarTexto(resultado.Country),
                idioma: normalizarTexto(resultado.Language)
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