const express = require('express');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });
const cookieSession = require('cookie-session');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path')
const cors = require('cors');
const bodyParser = require('body-parser');
const { env } = require('process');
const { URLSearchParams } = require('url');
const server = express();
const nodemailer = require("nodemailer");
const multer = require("multer");

server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cors());
server.options('*', cors());

server.use(express.static(__dirname));

var visitCounter = 0;

//Return index file (HTML)
server.get("/index", (req, res) => {
    visitCounter++;
    console.log("Visitation counter: " + visitCounter);
    res.sendFile("index.html", { root: __dirname });
});

server.get("/about", (req, res) => {
    visitCounter++;
    console.log("Visitation counter: " + visitCounter);
    res.sendFile("about.html", { root: __dirname });
});

server.get("/contact", (req, res) => {
    visitCounter++
    console.log("Visitation counter: " + visitCounter);
    res.sendFile("contact.html", { root: __dirname });
});

server.get("/login/index", (req, res) => {
    res.sendFile("/login/index.html", { root: __dirname });
});

server.get("/login/filesharing", (req, res) => {
    res.sendFile("/login/filesharing.html", { root: __dirname });
});

server.get("/login/movieandseries", (req, res) => {
    res.sendFile("/login/movieandseries.html", { root: __dirname });
});

//Ping for server check - Start
var pingCounter = 0;

server.get("/ping", (req, res) => {
    pingCounter++;
    console.log("ping caught");
    console.log("ping count: " + pingCounter);
    res.sendStatus(200);
    res.end();
});

//Ping for server check - End

//functions for mailing new contact forms - Start
var mailing = require("./ServerFiles/mailing"); //Import for using seperate file for method

var urlencodedParser = bodyParser.urlencoded({ extended: false })

server.post("/newContact", urlencodedParser, (req, res) => {
    const contactMail = JSON.parse(JSON.stringify(req.body)); //Parsing to itterable object
    console.log(contactMail);
    mailing.sendMail(contactMail);
    console.log(contactMail.Tlf);
});
// functions for mailing new contact forms - End

//For viewing uploaded files in the HTML - Start

server.get("/viewfiles", async(req, res) => {
    var myFiles = [];

    fs.readdir(path.join(__dirname, req.query.path), function(err, files) {
        if (err) {
            return console.log(err);
        }
        files.forEach(function(file) {
            var myFile = {};

            //setting type of file
            let extension = file.substr((file.lastIndexOf('.') + 1));
            switch (extension) {
                case "pdf":
                    myFile.type = "pdf";
                    break;
                case "docx":
                    myFile.type = "docx";
                    break;
                case "png":
                    myFile.type = "png";
                    break;
                case "avi":
                    myFile.type = "avi";
                    break;
                case "mp4":
                    myFile.type = "mp4";
                    break;
                default:
                    myFile.type = "default";
                    break;
            }

            //saving img location
            myFile.imgLocation = path.join("assets/filetypes/" + myFile.type + ".png");

            //setting title of file
            myFile.title = file;

            //setting path to file
            myFile.location = path.join(req.query.path + file);

            myFiles.push(myFile);
        });


        res.json(JSON.stringify(myFiles));
        res.end;
    });

});

//For viewing uploaded files in the HTML - End


//For uploading files to the server - Start
var urlencodedParser = bodyParser.urlencoded({ extended: true })

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploadedFiles");
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, originalname);
    }
})

const upload = multer({ storage: storage });


server.post("/addfile", upload.single('newFile'), urlencodedParser, (req, res) => {
    res.redirect("/login/filesharing");
});



//For uploading files to the server - End


//Login methods and calls - start (source: https://www.youtube.com/watch?v=EzQuFxRlUos&ab_channel=KevinSimper)
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
        res.redirect("/login/index");
    } else {
        console.log("Error - Something went wrong in callback")
        req.send("Error happend")
    }
});

server.get("login/index.html", (req, res) => {
    return res.redirect("/login/index");
});

server.get("/login/index", async(req, res) => {
    if (req.session && req.session.githubId === 32219634) {
        res.sendFile("login/index.html", { root: __dirname });
    } else if (req.session.githubId == null) {
        res.redirect("github");
    } else {
        res.sendFile("error_codes/restrictedAccess.html", { root: __dirname });
    }
});

server.get("/login/filesharing", async(req, res) => {
    if (req.session && req.session.githubId === 32219634) {
        res.sendFile("login/filesharing.html", { root: __dirname });
    } else if (req.session.githubId == null) {
        res.redirect("github");
    } else {
        res.sendFile("error_codes/restrictedAccess.html", { root: __dirname });
    }
});

server.get("/login/moviesandseries", async(req, res) => {
    if (req.session && req.session.githubId === 32219634) {
        res.sendFile("login/moviesandseries.html", { root: __dirname });
    } else if (req.session.githubId == null) {
        res.redirect("github");
    } else {
        res.sendFile("error_codes/restrictedAccess.html", { root: __dirname });
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