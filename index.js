const express = require('express')
const multer = require('multer') // Multer es una librería que me va a permitir generar filtros y condiciones para mis formularios
const joi = require("@hapi/joi")
const nodemailer = require("nodemailer") // Es una libreria que me va a servir para enviarme los datos del formulario, previamente testeados, por mail
const server = express()

const public = express.static("public") // En la constante públic se guarda la configuracion en la que digo que la carpeta public es un directorio con contenido estatico
const urlencoded = express.urlencoded({extended : true})
const json = express.json()
const upload = multer()

const schemaContact = joi.object({ // Con esto especifico las condiciones que debe tener cada parámetro
    nombre : joi.string().min(4).max(25).required(), // Tiene que ser string, y tener un min de 4 caracteres y un max de 25
    correo : joi.string().email({
        minDomainSegments: 2, // Esto significa que solamente admito correos que luego del @ se compongan de dos partes. Ej: gmail.com
        tlds: {
            allow: ['com', 'net', 'org'] 
        }
    }).required(),
    asunto : joi.string().alphanum().valid("ax14", "ax38", "ax45", "ax67").required(), // Solamente pueden ser alguno de estos cuatro valores
    mensaje : joi.string().min(10).max(100).required()
})

// PARA QUE MI TESTEO CON NODEMAILER FUNCIONE TENGO QUE HACER TRES PASOS:

//1) Crear la conexion con el Servidor de Email
const miniOutlook = nodemailer.createTransport({ // Es una constante que se va a encargar de enviar los correos.
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'judge.rodriguez0@ethereal.email',
        pass: 'aKghYrKAcCeFQQRWyX'
    }
});

//2) Verificar la conexion con el Servidor de Email
miniOutlook.verify((error, ok) => {
    error ? console.log("AAAHHHHH!!!") : console.log("Tudo bom, Tudo legal...")
})

// Estos son Middlewares: Las configuraciones que se ejecutan entre la llegada del dato y la peticion http se llaman Middleware // 
server.use(json)
server.use(urlencoded) 
server.use(upload.array()) // Le digo que parsee como array para que cuando me llegue el paquete de datos del formulario pueda tener un objeto o un array con muchos objetos 
server.use(public) // Le digo al servidor que use esta configuración que generé en la constante de arriba.
// Fin de Middlewares // 

server.post('/enviar', function (request, response){ // Le digo al server que en peticiones post envie datos a la ruta que le especifico
    
    const datos = request.body // Es el body del http, no tiene nada que ver con el body de html. Acá lo que estoy haciendo es traer los datos del body del urlencoded.

    console.log("Estos son los datos enviados: ")
    console.log(datos)
    
    const validacion = schemaContact.validate( datos )

    //console.log(validacion.error)
    if(validacion.error){
        response.json({ rta : "error", details : validacion.error.details })
    
    } else { //<--3) Si los datos son validos...enviar el mail
        
        miniOutlook.sendMail({
            from : datos.correo,
            to : "lucasjuarezsibello@gmail.com",
            subject : "Consulta desde Node",
            html : "<h1>Hola viteh!</h1>"
        }, function(error, info){
            const rta = error ? "Su consulta no pudo ser enviada" : "Gracias por su consulta :D"
            
            response.json({ rta })
        })
    }
    
})

server.listen(3000)