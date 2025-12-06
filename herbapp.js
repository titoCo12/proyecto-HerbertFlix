const express = require('express');
const fs = require('fs');
const path = require('path');
const herbapp = express();

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


//Endpoint base 
herbapp.get('/', (req, res) => {
    res.json({
        titulo: "🎬 Herbert Flix",
        endpoints: [
            'GET /api/pelis', 
            'GET /api/pelis/']
    })
});


//Endpoint todas las pelis del usuario
herbapp.get('/api/pelis', (req, res) => {
  const pelis = leerPelis();
  res.json({
    mensaje: 'Peliculas del usuario',
    total: pelis.length,
    peliculas: pelis
  });
});

 
//Endpoint pelis por titulo
herbapp.get('/api/pelis/busquedaTitulo/:titulo', (req, res) => {
    
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

herbapp.listen(3000, () => { 
    console.log("corriendo");
});