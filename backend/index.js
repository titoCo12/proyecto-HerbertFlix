// IMPORTS -----------------------------

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

//middleware para post
app.use(express.json());


// FUNCIONES ---------------------------

function leerPelis() {
    try {
        const ruta = path.join(__dirname, "localdata", "pelis.json");
        const pelis = fs.readFileSync(ruta, 'utf-8');
        return JSON.parse(pelis);
    }
    catch (error) {
        console.error('Error leyendo peliculas:', error);
        return [];
    }
}


function agregarPeli(peli) {
    try {
        const ruta = path.join(__dirname, "localdata", "pelis.json");
        const pelis = leerPelis();
        pelis.push(peli);
        
        //reescribo
        const datos = JSON.stringify(pelis, null, 2);
        fs.writeFileSync(ruta, datos, 'utf-8');
        
    } catch (error) {
        console.error('Error agregando película:', error);
        throw new Error('Error guardando película');
    }
}


function filtrarPelis(texto, pelis) {
    const textoLow = texto.toLowerCase().replace(/[^a-z0-9]/g, '');
    //case insensitive y solo me quedo alfanumericos
    return pelis.filter(p => 
        p.titulo.toLowerCase().replace(/[^a-z0-9]/g, '').includes(textoLow) ||
        p.director.toLowerCase().replace(/[^a-z0-9]/g, '').includes(textoLow));
}


function ordenarPelis(orden, ordenar_por, pelis) {
    const ordenDir = orden === 'desc' ? -1 : 1; // DESC - ASC    

    //ordeno copia para no ordenar original
    return [...pelis].sort((a, b) => {
            switch(ordenar_por) {
                case 'anio':
                    return (a.anio - b.anio) * ordenDir;

                case 'rating_personal':
                    // falta de rating personal (null) siempre va al fondo 
                    if (a.rating_personal === null && b.rating_personal === null) return 0;
                    if (a.rating_personal === null) return 1;  
                    if (b.rating_personal === null) return -1; 
                    return (a.rating_personal - b.rating_personal) * ordenDir;
                    
                case 'fecha_visto':
                    return (new Date(a.fecha_visto) - new Date(b.fecha_visto)) * ordenDir;
                    
                default:
                    return 0;
            }
    });
}

// ENDPOINTS GET ---------------------------


//Endpoint base 
app.get('/', (req, res) => {
    res.json({
    titulo: "🎬 Herbert Flix",
    endpoints: [
        'GET /api/pelis',
        'GET /api/pelis/']
    });
});


app.get('/api/mis-pelis', (req, res) => {
    try {
        let pelis = leerPelis();
        
        const { q:texto, watchlist, ordenar_por, orden } = req.query;
        
        // FILTRADO POR WATCHLIST
        if (watchlist === 'true') {
            pelis = pelis.filter(p => p.watchlist === true);
        }
        
        // BÚSQUEDA POR TEXTO
        if (texto) {
            pelis = filtrarPelis(texto, pelis);
        }
        
        // ORDENAMIENTO
        if (ordenar_por) {
            pelis = ordenarPelis(orden, ordenar_por, pelis);
        }
        
        // RESPUESTA
        res.json({
            mensaje: watchlist === 'true' ? 'Pelis en watchlist' : 'Todas las pelis',
            filtros: { texto, watchlist, ordenar_por, orden },
            resultados: pelis.length,
            peliculas: pelis
        });
        
    } catch (error) {
        console.error('Error en GET /api/mis-pelis:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// ENDPOINTS POST ----------------------

//Endpoint agregar 'visualización' de pelicula
app.post('/api/mis-pelis', (req,res) => {
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

        //uso timestamp para los id asi evito repetidos
        const nuevoId = Date.now();
        
        const nuevaVisualizacion = {
            id: nuevoId,
            imdb_id: datos.imdb_id,
            titulo: datos.titulo,
            anio: datos.anio,
            duracion_minutos: datos.duracion_minutos,
            director: datos.director,
            generos: datos.generos,
            rating_imdb: datos.rating_imdb,
            rating_personal: datos.rating_personal !== undefined ? datos.rating_personal : null,
            resenia: datos.resenia || "",
            fecha_visto: new Date().toISOString().split('T')[0],
            watchlist: false,
        };
        
        agregarPeli(nuevaVisualizacion);
        res.status(201).json({
            mensaje: "peli registrada",
            id: nuevoId,
            registro: nuevaVisualizacion
        });

    } catch (error) {
        console.error('Error en POST /api/mis-pelis:', error.message);
        res.status(500).json({ error: error.message });
    }
    
})


// INICIO ------------------------------

app.listen(PORT, () => { 
    console.log(`Corriendo en http://localhost:${PORT}`);
});