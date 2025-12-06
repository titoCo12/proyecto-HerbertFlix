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

// ENDPOINTS ---------------------------

//Endpoint base - GET
app.get('/', (req, res) => {
    res.json({
        titulo: "🎬 Herbert Flix",
        endpoints: [
            'GET /api/pelis', 
            'GET /api/pelis/']
    })
});


//Endpoint todas las pelis del usuario - GET
app.get('/api/pelis', (req, res) => {
  const pelis = leerPelis();
  res.json({
    mensaje: 'Peliculas del usuario',
    total: pelis.length,
    peliculas: pelis
  });
});

 
//Endpoint pelis por titulo - GET
app.get('/api/pelis/busqueda-titulo/:titulo', (req, res) => {
    
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

// INICIO ------------------------------

app.listen(PORT, () => { 
    console.log(`Corriendo en http://localhost:${PORT}`);
});