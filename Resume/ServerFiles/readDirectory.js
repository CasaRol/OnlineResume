const fs = require("fs");
const path = require("path")

//const directoryPath = path.join(__dirname, "../uploadedFiles");
var myFiles = [];

async function readDir(directoryPath) {

    fs.readdir(directoryPath, function(err, files) {
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
            }

            //setting title of file
            myFile.title = file;

            //setting path to file
            myFile.location = path.join(__dirname, ("../uploadedFiles/" + file));

            myFiles.push(myFile);
        });

        //console.log(myFiles);

        // var myreturn = JSON.stringify(myFiles);
        //console.log("myreturn = " + myreturn)
        return myFiles; //Returning
    });
}

module.exports = { readDir }