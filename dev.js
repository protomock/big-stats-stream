const http = require('http')
const EventEmitter = require('events')
const bigQueryStream = require('./index.js')
const events = new EventEmitter();
const config = { bigquery: { credentials: { client_email: process.env.CLIENT_EMAIL, private_key: process.env.PRIVATE_KEY}}}
bigQueryStream.init(Date.now(), config, events)

const server = http.createServer((req, res) => {
    req.on("data", (data) => {
        events.emit('flush', Date.now(), JSON.parse(data.toString('utf8')))
    })
});


server.listen(8888)