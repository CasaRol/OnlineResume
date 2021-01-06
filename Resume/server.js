const express = require('express');
require('dotenv').config({ path: __dirname + '/.env' });
const fetch = require('node-fetch');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { env } = require('process');
const { URLSearchParams } = require('url');
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
    const url = 'https://github.com/login/oauth/authorize?client_id=' + client_id + '&redirect_uri=http://casarol.site/login/github/callback';
    res.redirect(url);
});

async function getAccessToken(code) {
    const res = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            client_id,
            client_secret,
            code
        })
    })
    const data = await res.text();
    const params = new URLSearchParams(data);
    return params.get('access_token');
}

async function getGithubUser(access_token) {
    const req = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: 'bearer ${access_token}'
        }
    })
    const data = await req.json()
    return data;
}

server.get("/login/github/callback", async(req, res) => {
    const code = req.query.code
    const token = await getAccessToken(code)
    const githubData = await getGithubUser(token)
    res.json(githubData)
});

let port = 8080
server.listen(port);
console.log('server is listening on port ' + port);