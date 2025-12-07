// IMPORTS -----------------------------

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

//middleware para post
app.use(express.json());


// VALIDACIONES ------------------------

function validarPeliNueva(peli) {
    validarAtributosPeli(peli);
    validarPeliRepetida(peli);
}




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


//Endpoint todas las pelis del usuario
app.get('/api/mis-pelis', (req, res) => {
  
  try {
    const pelis = leerPelis();
    res.json({
        mensaje: 'Peliculas del usuario',
        total: pelis.length,
        peliculas: pelis
    });
  } 
  catch (error) {

  } 

});


//Endpoint pelis en watchlist
app.get('/api/mis-pelis/watchlist', (req, res) => {  
    const pelis = leerPelis().filter(p => p.watchlist);

    res.json({ 
        watchlist: pelis
    });
});


//Endpoint pelis por titulo 
app.get('/api/mis-pelis/busqueda/titulo/:titulo', (req, res) => {  
    const titulo_pedido = req.params.titulo;
    const titulo_lower = titulo_pedido.toLowerCase();

    const pelis = leerPelis().filter(p => 
        p.titulo.toLowerCase()       // no es case sensitive
        .replace(/[^a-z0-9]/gi, '')  // solo considero alfanumericos
        .includes(titulo_pedido));

    res.json({ 
        titulo_pedido: titulo_pedido,
        cant_resultados: pelis.length,
        resultados: pelis
    });
});

// ENDPOINTS POST ----------------------

//Endpoint agregar pelicula
app.post('api/mis-pelis', (req,res) => {
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
        
    }
    
})


// INICIO ------------------------------

app.listen(PORT, () => { 
    console.log(`Corriendo en http://localhost:${PORT}`);
});