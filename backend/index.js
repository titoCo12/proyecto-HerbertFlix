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
  const pelis = leerPelis();
  res.json({
    mensaje: 'Peliculas del usuario',
    total: pelis.length,
    peliculas: pelis
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


//Endpoint pelis por genero
//Recibe un string con la forma "gen1, gen2.." de parametro
app.get('/api/mis-pelis/busqueda/generos/:generos', (req, res) => {
    try {
        const generos = req.params.generos
            .split(",")
            .map(g => decodeURIComponent(g) //atajo acentos
                .trim()                     //saco espacios
                .toLowerCase());           

        const pelis = leerPelis().filter(p => 
            p.generos && generos.every(gen =>         
                p.generos.map(g => g.toLowerCase()).includes(gen) 
            ));

        res.json({
            generos: generos,
            cant_resultados: pelis.length,
            resultados: pelis
        })
    }

    catch (error) {
        res.status(400).json({ error: "Formato de Generos no valido"})
    }
});





// INICIO ------------------------------

app.listen(PORT, () => { 
    console.log(`Corriendo en http://localhost:${PORT}`);
});