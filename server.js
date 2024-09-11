require('dotenv').config()
const express = require('express')
const { port } = require('./app/config/index.js');
const server = express()
const app = require('./app.js')


server.use(app);


server.listen(port, () => {
  console.log(`Project Management App Api listening at http://localhost:${port}`)
})