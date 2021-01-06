const express = require('express');
require('dotenv').config({ path: __dirname + '/.env' });
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { env } = require('process');
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

server.get("/ping", (req, res) => {
    console.log("ping caught");
    res.sendStatus(200);
    res.end();
});

const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

server.get("/login/github", (req, res) => {
    const url = 'https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=http://casarol.site/login/github/callback';
    res.redirect(url);
});
server.get("/login/github/callback", (req, res) => {});

let port = 8080
server.listen(port);
console.log('server is listening on port ' + port);