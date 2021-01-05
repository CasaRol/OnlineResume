const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cors());
server.options('*', cors());

server.use(express.static(__dirname));

//Return index file (HTML)
server.route("/").get((req, res) => {

    console.log("testing");
    res.sendFile(__dirname + './Resume/index.html');

});

server.get('/ping', (req, res) => {
    console.log("ping caught");
    res.sendStatus(200);
    res.end();
})

let port = 8080
server.listen(port);
console.log('server is litening on port ' + port);