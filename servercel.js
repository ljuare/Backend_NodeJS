const express = require ('express')
const server = express()

server.use(express.static(__dirname + "/public")
server.listen ( process.env.PORT || 2000 )

module.exports = server