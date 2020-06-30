const express = require('express')
const { MongoClient } = require('mongodb') // Esto significa: extraeme la propiedad mongoclient
const server = express()

const urlencoded = express.urlencoded({extended : true})
const json = express.json()

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_BASE}?retryWrites=true&w=majority`

let DB = null // Creo una variable global que se va a encargar de guardar los datos luego de que me conecte con las bases de datos de MongoDB


MongoClient.connect(url, { useUnifiedTopology: true }, function(error, client){

    DB = client.db("MercadoTECH")

}) // Me conecto a MongoDB


//console.log("El servidor de MongoDB es: ")
//console.log(process.env.MONGODB_HOST)

server.use(json)
server.use(urlencoded) 
server.listen(3000)

server.get("/api", (req, res) => {
    res.json(DB)
    console.log( DB.collection('Productos').find({}).toArray() )
    res.json( DB.collection('Productos').find({}).toArray() )
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

    const encontrado = DB.find(item => item.id == datos.id) // Con la funcion find le digo que me busque el id de la propiedad item(inventada) si es igual a el item de datos que defini en mi funcion POST
    encontrado.stock = datos.stock
    
    res.json({ rta : "ok"})
}) // <-- Actualizar con datos

server.delete("/api", (req, res) => {
    res.json({ rta : "Acá vas a eliminar productos"})
}) // <-- Eliminar con datos

