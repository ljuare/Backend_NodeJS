const express = require('express')
const hbs = require ('express-handlebars')
const { MongoClient } = require('mongodb') // Esto significa: extraeme la propiedad mongoclient
const {ObjectId} = require('mongodb') // Para hacer una busqueda por ID se necesita esta funcion que pertenece a MongoDB
const jwt = require("jsonwebtoken") // Modulo para crear token de seguridad para las paginas
const cookieParser = require("cookie-parser")
const server = express()

const urlencoded = express.urlencoded({extended : true})
const json = express.json()
const public = express.static(__dirname + "/public")
const cookies = cookieParser()

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_BASE}?retryWrites=true&w=majority`

const connectDB = async () => { // Creo la funcion asincronica connectDB que va a primero esperar a que se conecte MongoDB y despues a que se conecte la base de datos MercadoTech

    const client = await MongoClient.connect(url, { useUnifiedTopology: true })

    return await client.db("MercadoTECH")

}

//let DB = null // Creo una variable global que se va a encargar de guardar los datos luego de que me conecte con las bases de datos de MongoDB

//connectDB() // Acá ejecuto la función que cree arriba
const port = process.env.PORT || 3000

const base_url = req => req.protocol + "://" + req.hostname + ":" + port

server.use(json)
server.use(urlencoded)
server.use(cookies)

server.set("view engine", "handlebars") // Seteo el motor de vistas de handlebars
server.engine("handlebars", hbs()) // Lo seteo en la constante que cree arriba. Con esto ya tengo configurado hbs en mi sistema

server.use("/", public)
server.listen(port)

const verifyToken = (req, res, next) => {
    //aca hay que verificar el token...
    const token = req.cookies._auth

    //console.log(token)

    jwt.verify(token, process.env.JWT_PASSPHRASE, (error, data) => {
        if(error){
            res.redirect( base_url(req) + "/admin/ingresar")
        } else {
            // ↓ Acá desencripto el JWT y accedo a los datos...
            req.user = data.usuario
            next()
        }
    })
}

// Inicio de Rutas del Dashboard //
server.get("/admin", verifyToken, async (req, res) => {
    const DB = await connectDB()
    
    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()

    //console.log("Los productos son: ")
    //console.log(resultado)

    res.render("panel", { 
        url : base_url(req), // <-- htto://localhost:3000
        items : resultado
    }) // Acá arme la http para poder editar el producto
    //res.render("formulario", {ACCION : "Nuevo"}) // El metodo render renderiza la plantilla html que yo le diga
    // Esta plantilla ahora tiene q tener .handlebar y no html y debo especificar que no exite la carpeta layout que por defecto es obligatoria
})
server.get("/admin/nuevo", verifyToken, (req, res) => {
    res.render("formulario", { 
        url : base_url(req),
        accion : "Nuevo",
        metodo : "POST"
    })

})

server.get("/admin/editar/:id", verifyToken, async (req, res) => {
    // OBTENER EL PRODUCTO A EDITAR //
    const ID = req.params.id
    const DB = await connectDB()
    const productos = await DB.collection('Productos')
    const query = { "_id" : ObjectId(ID) }
    const resultado = await productos.find( query ).toArray()
    /////////////////////////////////
    res.render("formulario", { 
        url : base_url(req),
        accion : "Actualizar",
        metodo : "PUT",
        ...resultado[0]
    })

})

server.get("/admin/ingresar", (req, res) => {
    res.render("login", { 
        url : base_url(req)
     })
})
// Fin de Rutas del Dashboard //

////////////// API REST //////////////

server.get("/api", async (req, res) => { //<-- Obtener los datos
    const DB = await connectDB()
    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()
    
    res.json( resultado )
})

server.get("/api/:id", async (req, res) => {
    const DB = await connectDB()
    const productos = await DB.collection('Productos')
    
    const ID = req.params.id

    const query = { "_id" : ObjectId(ID) }
    
    const resultado = await productos.find( query ).toArray()

    res.json( resultado )
})

server.post("/api", async (req, res) => { //<-- Crear con datos
    /*
        Requisitos del ID:
        - Unico
        - Irrepetible
        - Autoasignable
    */
    const datos = req.body //<--- { nombre: "Cafe", stock: "700", precio: "85.75", disponible: "true" }
    const DB = await connectDB()
    const productos = await DB.collection("Productos")

    const { result } = await productos.insertOne( datos )

    res.json({ rta : result.ok })  
})

server.put("/api/:id", async (req, res) => { //<-- Actualizar con datos
    const DB = await connectDB()
    const ID = req.params.id
    const datos = req.body

    const productos = await DB.collection("Productos")

    const query = { "_id" : ObjectId( ID ) }
    
    const update = {
        $set : { ...datos }
    }

    const { result } = await productos.updateOne( query, update )

    res.json({ rta : result.ok })
})

server.delete("/api/:id", async (req, res) => { //<-- Eliminar los datos
    const DB = await connectDB()
    const ID = req.params.id

    const productos = await DB.collection("Productos")

    const query = { "_id" : ObjectId(ID) }

    const result  = await productos.findOneAndDelete( query )
    
    res.json({ rta : result.ok })
})

////////////// JWT Login //////////////

server.post("/login", (req, res) => {

    const datos = req.body

    if( datos.email == "pepito@gmail.com" && datos.clave == "pepito" ){

        const duracion = 15 // 15 minutos
        const vencimientoTimestamp = Date.now() + (60 * 1000 * duracion) //<--- Dentro de 5 minutos
        const vencimientoFecha = new Date( vencimientoTimestamp ) 
        
        const token = jwt.sign({ usuario : datos.email, expiresIn : (duracion * 60) }, process.env.JWT_PASSPHRASE)
        
        res.cookie("_auth", token, { expires : vencimientoFecha, httpOnly : true, sameSite : "Strict", secure : false })

        res.redirect( base_url(req) + "/admin")

    } else {
        res.json({ rta : "Datos incorrectos" })
    }

})
