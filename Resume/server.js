const express = require('express');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const cookieSession = require('cookie-session');
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
    res.sendFile('./Resume/index.html');

});

//Ping for server check - Start

server.get("/ping", (req, res) => {
    console.log("ping caught");
    res.sendStatus(200);
    res.end();
});

//Ping for server check - End

//Login methods and calls - start
const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;
const cookie_secret = process.env.COOKIE_SECRET

server.use(
    cookieSession({
        secret: cookie_secret
    })
);

server.get("/login/github", (req, res) => {
    const url = 'https://github.com/login/oauth/authorize?client_id=' + client_id + '&redirect_uri=http://casarol.site/login/github/callback';
    res.redirect(url);
});

async function getAccessToken({ code, client_id, client_secret }) {
    const request = await fetch('https://github.com/login/oauth/access_token', {
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
    const text = await request.text();
    const params = new URLSearchParams(text);
    return params.get('access_token');
}

async function getGithubUser(access_token) {
    const req = await fetch('https://api.github.com/user', {
        headers: {
            "Authorization": "token " + access_token
        }
    })
    return await req.json()
}

server.get("/login/github/callback", async(req, res) => {
    const code = req.query.code;
    const access_token = await getAccessToken({ code, client_id, client_secret });
    const user = await getGithubUser(access_token);
    if (user) {
        req.session.access_token = access_token;
        req.session.githubId = user.id;
        res.redirect("/login/index.html");
    } else {
        console.log("Error - Something went wrong in callback")
        req.send("Error happend")
    }
});

server.get("/login/index", async(req, res) => {
    if (req.session && req.session.githubId === 32219634) {
        console.log("session id= " + req.session.githubId);
        console.log("my id= " + "32219634")
        res.sendFile("/login/index.html");
    } else {
        res.redirect("/login/github");
    }
});

server.get("/logout", (req, res) => {
    if (req.session) {
        req.session == null;
        res.redirect("/");
    }
})

//Login methods and calls - End

let port = 8080
server.listen(port);
console.log('server is listening on port ' + port);