const express = require('express')
const server = express()

const urlencoded = express.urlencoded({extended : true})
const json = express.json()

const DB = []

console.log(DB)

server.use(json)
server.use(urlencoded) 
server.listen(3000)

server.get("/api", (req, res) => {
    res.json(DB)
}) // <--- Obtener los datos

server.post("/api", (req, res) => {
    /*
        Requisitos del ID: 
        - Debe ser único
        - Debe ser irrepetible
        - Debe ser autoasignable (lo asigna el sistema)
    */    
    
    const datos = req.body
    const id = new Date().getTime() // new Date es el objeto del tiempo y si le pongo getTime me va a arrojar el momento en que se crea el ID

    DB.push({ id, ...datos }) // Estos 3 puntitos rompen el objeto que tomo arriba en el req.body y convierte cada propiedad del objeto en variables sueltas
    // Si hago los puntitos adentro de un par de {} lo vuelvo a construir y esa es mi posibilidad de agregarle una nueva propiedad, que es el ID
    // El metodo push es para agregar un nuevo item a un array
    console.log(DB)

    res.json({ rta : "Ok"})
}) // <-- Crear con datos

server.put("/api", (req, res) => {
    const datos = req.body

    const encontrado = DB.find(item => item.id == datos.id) // Con la funcion find le digo que me busque el id
    encontrado.stock = datos.stock
    
    res.json({ rta : "ok"})
}) // <-- Actualizar con datos

server.delete("/api", (req, res) => {
    res.json({ rta : "Acá vas a eliminar productos"})
}) // <-- Eliminar con datos