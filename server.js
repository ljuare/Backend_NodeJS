const express = require('express')
const { MongoClient } = require('mongodb') // Esto significa: extraeme la propiedad mongoclient
const {ObjectId} = require('mongodb') // Para hacer una busqueda por ID se necesita esta funcion que pertenece a MongoDB
const server = express()

const urlencoded = express.urlencoded({extended : true})
const json = express.json()

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_BASE}?retryWrites=true&w=majority`

const connectDB = async () => { // Creo la funcion asincronica connectDB que va a primero esperar a que se conecte MongoDB y despues a que se conecte la base de datos MercadoTech

    const client = await MongoClient.connect(url, { useUnifiedTopology: true })

    DB = await client.db("MercadoTECH")

}

let DB = null // Creo una variable global que se va a encargar de guardar los datos luego de que me conecte con las bases de datos de MongoDB

connectDB() // Acá ejecuto la función que cree arriba

server.use(json)
server.use(urlencoded) 
server.listen(3000)

server.get("/api", async (req, res) => {
    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()

    res.json( resultado )
}) // <--- Obtener los datos

server.get("/api/:id", async (req, res) => {
    const productos = await DB.collection('Productos')

    const ID = req.params.id
    const query = {"_id" : ObjectId(ID)}

    const resultado = await productos.find(query).toArray()

    res.json(resultado)
}) // <--- Buscar por ID


server.post("/api", async (req, res) => {
    /*
        Requisitos del ID: 
        - Debe ser único
        - Debe ser irrepetible
        - Debe ser autoasignable (lo asigna el sistema)
    */    
    
    const datos = req.body
    const productos = await DB.collection("Productos")

    const { result } = await productos.insertOne(datos) // InsertOne es el metodo para insertar productos una vez que tenga la coleccion productos definido arriba


    // DB.push({ id, ...datos }) // Estos 3 puntitos rompen el objeto que tomo arriba en el req.body y convierte cada propiedad del objeto en variables sueltas
    // Si hago los puntitos adentro de un par de {} lo vuelvo a construir y esa es mi posibilidad de agregarle una nueva propiedad, que es el ID
    // El metodo push es para agregar un nuevo item a un array

    res.json({ rta : result.ok })
}) // <-- Crear con datos

server.put("/api/:id", async (req, res) => {
    const ID = req.params.id
    const datos = req.body

    const productos = await DB.collection("Productos")

    const query = {"_id" : ObjectId(ID)}
    const update = { $set : { ...datos } } // Esto significa setear el dato que va a ser cambiado
    // En cosnt update, con los 3 puntitos le digo que agarre la constante datos, la separe y le setee el dato que yo necesite (nombre y/o stock y/o marca, etc)
    
    const {result} = await productos.updateOne(query, update) // UpdateOne es un metodo para actualizar un item o una actualizacion masica (ej: todos los productos menores a 500 de stock, pasarlos a 1000)
    
    res.json({ rta : result.ok })
}) // <-- Actualizar con datos

server.delete("/api/:id", async (req, res) => {
    const ID = req.params.id

    const productos = await DB.collection("Productos")

    const query = {"_id" : ObjectId(ID)}

    const result = await productos.findOneAndDelete(query) // findanddelete es un metodo para encontrar y borrar un dato

    res.json({ rta : result.ok })
}) // <-- Eliminar con datos

