const express = require('express')
const server = express()

const public = express.static("public") // En la constante públic se guarda la configuracion en la que digo que la carpeta public es un directorio con contenido estatico
server.use(public) // Le digo al servidor que use esta configuración que generé en la constante de arriba.


server.post('/', function (req, res){ // Le digo al server que en peticiones post envie datos a la ruta que le especifico
    res.send('<h1>Hello World<h1/>') // Acá programaré que es lo que quiero hacer con los datos que me llegan
})

server.listen(3000)