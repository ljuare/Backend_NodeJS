const express = require('express')
const hbs = require ('express-handlebars')
const { MongoClient } = require('mongodb') // Esto significa: extraeme la propiedad mongoclient
const {ObjectId} = require('mongodb') // Para hacer una busqueda por ID se necesita esta funcion que pertenece a MongoDB
const jwt = require("jsonwebtoken") // Modulo para crear token de seguridad para las paginas
const server = express()

const urlencoded = express.urlencoded({extended : true})
const json = express.json()
const public = express.static(__dirname + "/public")

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_BASE}?retryWrites=true&w=majority`

const connectDB = async () => { // Creo la funcion asincronica connectDB que va a primero esperar a que se conecte MongoDB y despues a que se conecte la base de datos MercadoTech

    const client = await MongoClient.connect(url, { useUnifiedTopology: true })

    return await client.db("MercadoTECH")

}

//let DB = null // Creo una variable global que se va a encargar de guardar los datos luego de que me conecte con las bases de datos de MongoDB

//connectDB() // Acá ejecuto la función que cree arriba
const port = process.env.PORT || 3000

server.use(json)
server.use(urlencoded)

server.set("view engine", "handlebars") // Seteo el motor de vistas de handlebars
server.engine("handlebars", hbs()) // Lo seteo en la constante que cree arriba. Con esto ya tengo configurado hbs en mi sistema

server.use("/", public)
server.listen(port)

// Inicio de Rutas del Dashboard //
server.get("/admin", async (req, res) => {
    const DB = await connectDB()
    
    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()

    //console.log("Los productos son: ")
    //console.log(resultado)

    res.render("main", { layout : false, items : resultado, url : req.protocol + "://" + req.hostname + ":" + port }) // Acá arme la http para poder editar el producto

    //res.render("formulario", {ACCION : "Nuevo"}) // El metodo render renderiza la plantilla html que yo le diga
    // Esta plantilla ahora tiene q tener .handlebar y no html y debo especificar que no exite la carpeta layout que por defecto es obligatoria
})
server.get("/admin/editar/:id", async (req,res) => {
    res.end(`Acá hay que editar el producto: ${req.params.id}`)
})
// Fin de Rutas del Dashboard //

server.get("/api", async (req, res) => {
    const DB = await connectDB()
    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()


    res.json( resultado )
}) // <--- Obtener los datos

server.get("/api/:id", async (req, res) => {
    const DB = await connectDB()
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
    const DB = await connectDB()
    const datos = req.body
    const productos = await DB.collection("Productos")

    const { result } = await productos.insertOne(datos) // InsertOne es el metodo para insertar productos una vez que tenga la coleccion productos definido arriba


    // DB.push({ id, ...datos }) // Estos 3 puntitos rompen el objeto que tomo arriba en el req.body y convierte cada propiedad del objeto en variables sueltas
    // Si hago los puntitos adentro de un par de {} lo vuelvo a construir y esa es mi posibilidad de agregarle una nueva propiedad, que es el ID
    // El metodo push es para agregar un nuevo item a un array

    res.json({ rta : result.ok })
}) // <-- Crear con datos

server.put("/api/:id", async (req, res) => {
    const DB = await connectDB()
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
    const DB = await connectDB()
    const ID = req.params.id

    const productos = await DB.collection("Productos")

    const query = {"_id" : ObjectId(ID)}

    const result = await productos.findOneAndDelete(query) // findanddelete es un metodo para encontrar y borrar un dato

    res.json({ rta : result.ok })
}) // <-- Eliminar con datos

//////////// JWT Test /////////////
const verifyToken = (req, res, next) => { // Este midleware 
    // Aca hay que verificar el token...
    const token = req.query.token


    jwt.verify(token, process.env.JWT_PASSPHRASE, (error) => {
        if(error){
            res.json({rta : "Acceso no autorizado"})
        } else {
            req.user = data.usuario
            next()
        }
    })
}


server.post("/login", (req,res) => {

    const datos = req.body

    if( datos.email == "pepito@gmail.com" & datos.clave == "HolaDonPepito2020" ){
        
        const token = jwt.sign({ usuario : datos.email , expiresIn : 300 }, process.env.JWT_PASSPHRASE) // payload es la informacion que quiero guardar del token para autorizar la auntenticacion - exp es el tiempo de duración que va a tener la autenticacion - phassphrase es mi contraseña suprsecreta que va a terminar de generar mi firma

        res.json({rta : "Estas logeado", token})

    } else {
        res.json({rta : "Datos incorrectos"})
    }

})

server.get("/check", verifyToken,  (req,res) => {
    // Aca voy a decir si el token es valido o no...
    res.end(`Bienvenido "${req.user}"`)
})
