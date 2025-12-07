const fs = require('fs');
const path = require('path');


// HELPERS -----------------------------

function leerPelis(archivo) {
    try {
        const ruta = path.join(__dirname, "..", "localdata", `${archivo}.json`);
        const pelis = fs.readFileSync(ruta, 'utf-8');
        return JSON.parse(pelis);
    }
    catch (error) {
        console.error(`Error leyendo ${archivo}.json`, error);
        return [];
    }
}


function guardarDatos(coleccion, archivo) {
    try {
        const ruta = path.join(__dirname, "..", "localdata", `${archivo}.json`);
        
        const datos = JSON.stringify(coleccion, null, 2);
        fs.writeFileSync(ruta, datos, 'utf-8');
        
    } catch (error) {
        console.error(`Error escribiendo en ${archivo}.json:`, error);
        throw new Error('Error guardando película');
    }
}


function agregarRegistro(peli, archivo) {
    const coleccion = leerPelis(archivo);
    coleccion.push(peli);
    guardarDatos(coleccion, archivo);
}


function busquedaDePelis(pelis, texto, ordenar_por, orden) {
    
    // filtro por texto
    if (texto) {
        pelis = filtrarPelis(texto, pelis);
    }
    // orden
    if (ordenar_por) {
        pelis = ordenarPelis(orden, ordenar_por, pelis);
    }

    return pelis;
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


module.exports = {
    leerPelis,
    guardarDatos,
    agregarRegistro,
    busquedaDePelis
};
