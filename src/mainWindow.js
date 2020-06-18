const { remote } = require("electron");
const { dialog } = require("electron").remote;
const path = require("path");
const AdmZip = require('adm-zip');
const Swal = require('sweetalert2');
const fs = require("fs");
const { https } = require('follow-redirects');
const { ncp } = require("ncp");

const descLink = document.getElementById("link");
const rTag = document.getElementById("tag");
const textLog = document.getElementById("log");

const winButton = document.getElementById("winB");
const linButton = document.getElementById("linB");
const pyButton = document.getElementById("pyB");

let rel = remote.getGlobal("release")
rTag.innerHTML = rel["tag_name"];

function download(url, dest) {
    return new Promise((resolve, reject) => {

        const file = fs.createWriteStream(dest);
        const request = https.get(url, (res) => {
            if (res.statusCode !== 200) {
                Swal.fire("Error!", "Bad status code", "error");
                reject(`bad status code ${res.statusCode}`);
            }
            res.pipe(file);
        })

        file.on("finish", () => resolve(file));

        request.on("error", (err) => {
            Swal.fire("Error!", err.message, "error");
            fs.unlink(dest, () => reject("request error"))
        })

        file.on("error", (err) => {
            fs.unlinkSync(dest);
            Swal.fire("Error!", err.message, "error");
            reject("file error");
        })

        request.end();
    })
}

const processName = path.basename(process.env.PORTABLE_EXECUTABLE_FILE); // comment this line for linux version
function deleteFolderRecursive (filePath) {
    if (fs.existsSync(filePath) ) {
        fs.readdirSync(filePath).forEach(function(file) {
          let curPath = filePath + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) {
                if (curPath.toLowerCase().includes("resources") || curPath.toLowerCase().includes("ressources")) {
                    console.log("ressource folder detected")
                } else {
                    deleteFolderRecursive(curPath);
                    fs.rmdirSync(curPath)
                }
            } else {
                if (curPath.includes(processName)) {// comment this line for linux version
                    console.log("Current process")// comment this line for linux version
                } else {// comment this line for linux version
                    fs.unlinkSync(curPath);
                }// comment this line for linux version
            }
        });
    }
};

descLink.onclick = function() {
    Swal.fire(
        "Release description",
        rel.body,
        "info"
    )
}

winButton.onclick = async function() {

    let filePath = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    filePath = filePath.filePaths.toString()

    Swal.fire({
      title: "Correct path?",
      text: `Are you sure that the path is correct ( ${filePath} )?\nIt gonna delete everything in folder (except ressources folders)` ,
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then(async (result) => {
        if (result.value) {
            const url = rel.assets[1]["browser_download_url"];
            const dest = filePath + "/masterzipped.zip"
            
            textLog.innerHTML += "&#13;&#10;Deleting old files ...";
            deleteFolderRecursive(filePath);

            textLog.innerHTML += "&#13;&#10;Downloading files from GitHub ...";
            const zipped = await download(url, dest)
            textLog.innerHTML += "&#13;&#10;Download complete";

            let zip = new AdmZip(zipped.path);
            zip.extractAllTo(filePath, true)
            textLog.innerHTML += "&#13;&#10;Extraction complete";

            textLog.innerHTML += "&#13;&#10;Moving files in parent directory";
            const unzipped = filePath + "/Unzip_Windows_Release"
            ncp(unzipped, filePath, (err) => {
                if (err) {
                    return Swal.fire("Error!", "Error occured while copying files", "error");
                }
                textLog.innerHTML += "&#13;&#10;Deleting update files ...";
                deleteFolderRecursive(unzipped);
                fs.rmdir(unzipped, (err) => {
                    if (err) {
                        return Swal.fire("Error!", "Error occured when deleting files", "error");
                    }
                })
                fs.unlink(zipped.path ,(err) => {
                    if (err) {
                        return Swal.fire("Error!", "Error occured when deleting files", "error");
                    }

                    textLog.innerHTML += "&#13;&#10;Finished!";
                    Swal.fire("Success", "Finished!", "success"); 
                })
            })
        } else {
            return;
        }
    })
}

linButton.onclick = async function() {
    let filePath = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    filePath = filePath.filePaths.toString()
    

    Swal.fire({
      title: "Correct path?",
      text: `Are you sure that the path is correct ( ${filePath} )?\nIt gonna delete everything in folder (except ressources folders)` ,
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then(async (result) => {
        if (result.value) {
            const url = rel.assets[0]["browser_download_url"];
            const dest = filePath + "/masterzipped.zip"
            
            textLog.innerHTML += "&#13;&#10;Deleting old files ...";
            deleteFolderRecursive(filePath);

            textLog.innerHTML += "&#13;&#10;Downloading files from GitHub ...";
            const zipped = await download(url, dest)
            textLog.innerHTML += "&#13;&#10;Download complete";

            let zip = new AdmZip(zipped.path);
            zip.extractAllTo(filePath, true)
            textLog.innerHTML += "&#13;&#10;Extraction complete";

            textLog.innerHTML += "&#13;&#10;Moving files in parent directory";
            const unzipped = filePath + "/Unzip_Linux_Release"
            ncp(unzipped, filePath, (err) => {
                if (err) {
                    return Swal.fire("Error!", "Error occured while copying files", "error");
                }
                textLog.innerHTML += "&#13;&#10;Deleting update files ...";
                deleteFolderRecursive(unzipped);
                fs.rmdir(unzipped, (err) => {
                    if (err) {
                        return Swal.fire("Error!", "Error occured when deleting files", "error");
                    }
                })
                fs.unlink(zipped.path ,(err) => {
                    if (err) {
                        return Swal.fire("Error!", "Error occured when deleting files", "error");
                    }

                    textLog.innerHTML += "&#13;&#10;Finished!";
                    Swal.fire("Success", "Finished!", "success"); 
                })
            })
        } else {
            return;
        }
    })
}

pyButton.onclick = async function() {
    let filePath = await dialog.showOpenDialog({ properties: ["openDirectory"] });
    filePath = filePath.filePaths.toString()
    

    Swal.fire({
      title: "Correct path?",
      text: `Are you sure that the path is correct ( ${filePath} )?\nIt gonna delete everything in folder (except ressources folders)` ,
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then(async (result) => {
        if (result.value) {
            const url = rel.assets[0]["browser_download_url"];
            const dest = filePath + "/masterzipped.zip"
            
            textLog.innerHTML += "&#13;&#10;Deleting old files ...";
            deleteFolderRecursive(filePath);

            textLog.innerHTML += "&#13;&#10;Downloading files from GitHub ...";
            const zipped = await download(url, dest)
            textLog.innerHTML += "&#13;&#10;Download complete";

            let zip = new AdmZip(zipped.path);
            zip.extractAllTo(filePath, true)
            textLog.innerHTML += "&#13;&#10;Extraction complete";

            textLog.innerHTML += "&#13;&#10;Moving files in parent directory";
            const unzipped = filePath + "/Unzip_Linux_Release"
            ncp(unzipped, filePath, (err) => {
                if (err) {
                    return Swal.fire("Error!", "Error occured while copying files", "error");
                }
                textLog.innerHTML += "&#13;&#10;Deleting update files ...";
                deleteFolderRecursive(unzipped);
                fs.rmdir(unzipped, (err) => {
                    if (err) {
                        return Swal.fire("Error!", "Error occured when deleting files", "error");
                    }
                })
                fs.unlink(zipped.path ,(err) => {
                    if (err) {
                        return Swal.fire("Error!", "Error occured when deleting files", "error");
                    }

                    textLog.innerHTML += "&#13;&#10;Finished!";
                    Swal.fire("Success", "Finished!", "success"); 
                })
            })
        } else {
            return;
        }
    })
}
