const fs = require("fs")
const drives = require("windows-drive-letters")
const wget = require("node-wget")
const prompt = require("promptly")
const copyfiles = require('copyfiles');
const isElevated = require('is-elevated');
const exec = require('child_process').exec
const bannedfolder = [ //ban big folder to speed up the search
    "C:\\Windows"
]
const bannedname = [ //ban redundant or big folder name to speed up the search
    "node_modules",
    "gradle",
    "Git",
    "minecraft",
    "android"
]
let uninstall
let length = [0, 0, false]
isElevated().then(async (elevated) => { //check if admin permission are available
    if (!elevated) {
        console.log("You launch the installer without adminstrator permission \nIf you csgo is install in a proteted folder, launch as administrator")
        if (fs.existsSync(process.env.appdata + "/Csgorpc/csgorpc_win.exe")) {
            responce = await prompt.prompt("The file are already installed, do you want to uninstall? [Y/n]")
            if (responce.toLowerCase() === "y") {
                uninstall = true
                exec("taskkill /im csgorpc_win.exe /F",()=>{
                    fs.unlink(process.env.appdata + "/Microsoft/Windows/Start Menu/Programs/Startup/csgorpc.vbs", (err) => { }) //delete startup script
                    fs.unlink(process.env.appdata + "/Csgorpc/csgorpc_win.exe", (err) => { }) //delete csgorpc_win.exe
                })
            }
        }
        drives.usedLetters().then((letters) => { //get all conected disk
            letters = ["f"]
            length[1] = letters.length
            for (let i = 0; i < letters.length; i++) {
                const letter = letters[i];
                console.log("Searching in " + letter + ":")
                length[0]++
                if (letter + ":" === __dirname.split("\\")[0]) { search(letter + ':\\') } // fix the search on the disk where is the installer
                search(letter + ':') //start the search for one disk
            }

        }).catch((err) => {
            console.error(err);
        });
    }
});

function search(folder) {
    const dir = fs.readdirSync(folder) //read the folder
    for (let i = 0; i < dir.length; i++) {
        const element = dir[i];
        if (bannedfolder.indexOf(folder + "\\" + element) === -1) { //check if the folder is banned
            pass = true
            for (let i = 0; i < bannedname.length; i++) {
                const name = bannedname[i];
                if ((folder + "\\" + element).includes(name)) {
                    var pass = false //check if the folder is banned
                }
            }
            if (pass) {
                try {
                    let stats = fs.statSync(folder + "\\" + element)
                    if (stats) {
                        if (stats.isDirectory()) { //check if this is a file or a folder
                            if ((folder + "\\" + element).includes("common\\Counter-Strike Global Offensive\\csgo\\cfg")) { //check if the Path containt the csgo cfg folder 
                                let foldsplit = (folder + "\\" + element).split("\\")
                                if (foldsplit[foldsplit.length - 1] === "cfg") {
                                    if (uninstall) {
                                        fs.unlink(folder + "\\" + element + "\\gamestate_integration_discordrpc.cfg", (err) => {
                                            length[2] = true
                                            end()
                                        }) //delete the config file
                                    } else {
                                        console.log("Installing the config file in " + folder + "\\" + element + " ...")
                                        wget("http://51.75.27.87/gamestate_integration_discordrpc.cfg", () => { //download the config
                                            copyfiles(["gamestate_integration_discordrpc.cfg", folder + "\\" + element], (err) => { //copy the config
                                                fs.unlink("gamestate_integration_discordrpc.cfg", (err) => { })//delete the config
                                            })
                                            console.log("done!")
                                            length[2] = true
                                            end()
                                        })
                                    }
                                }
                            }
                            search(folder + "\\" + element) //check for the next folder
                        }
                    }
                } catch (error) {

                }
            }

        }
    }
}
async function end() {
    if (length[2] === false) { // if cant find the folder 
        console.log("I cant find your CSGO cfg. \nplease enter the path to your csgo folder")
        let folder = await prompt.prompt("cfg folder of csgo >") //prompt for the path of the csgo cfg folder
        wget("http://51.75.27.87/gamestate_integration_discordrpc.cfg", () => { //download the config
            copyfiles(["gamestate_integration_discordrpc.cfg", folder], (err) => { }) //copy the config
            fs.unlinkSync("gamestate_integration_discordrpc.cfg") //delete the config
            console.log("done!")
        })
    }
    if (length[0] === length[1]) { //if all disk are checked
        if (uninstall) {
            console.log("Uninstall finish!")
            console.log('Press any key to exit');
            process.stdin.setRawMode(true);
            process.stdin.resume(); //Pause
            process.stdin.on('data', process.exit.bind(process, 0)); //exit
        } else {
            responce = await prompt.prompt("starting with the pc? [Y/n]") //prompt for Yes or no
            if (responce.toLowerCase() === "y") {
                if (fs.existsSync("csgorpc_win.exe")) { // verify if the exe is here
                    install_startup("csgorpc_win.exe")
                } else if (fs.existsSync("build\\csgorpc_win.exe")) {
                    fs.copyFileSync("build\\csgorpc_win.exe", "csgorpc_win.exe") //fix for the copy on %appdata%\Csgorpc if the exe is in the build folder
                    install_startup("build")
                } else {
                    console.error("Can't find csgorpc_win.exe")
                }
            }
            let start = await prompt.prompt("Run now? [Y/n]") //prompt for run in the end of installator
            if (start.toLowerCase() === "y") {
                if (fs.existsSync(process.env.appdata + "/Csgorpc/csgorpc_win.exe")) {
                    exec("start " + process.env.appdata + "/Csgorpc/csgorpc_win.exe")   //if exe in %appdata% exist exec
                } else if (fs.existsSync("csgorpc_win.exe")) {
                    exec("start csgorpc_win.exe") //if exe exist exec
                } else {
                    console.log("Can't find csgorpc_win.exe")
                }
            }
            console.log('Press any key to exit');
            process.stdin.setRawMode(true);
            process.stdin.resume(); //Pause
            process.stdin.on('data', process.exit.bind(process, 0)); //exit
        }
    }
}

function install_startup(csgopath) {
    wget("http://51.75.27.87/csgorpc.vbs", () => { //download the startup file
        copyfiles(["csgorpc.vbs", process.env.appdata + "/Microsoft/Windows/Start Menu/Programs/Startup"], (err) => { //copy in shell:startup
            fs.unlink("csgorpc.vbs", (err) => { }) //delete the file in the current folder
            copyfiles(["csgorpc_win.exe", process.env.appdata + "/Csgorpc/"], (err) => { //move csgorpc_win.exe in %appdata%/Csgorpc
                if (csgopath === "build") {
                    fs.unlink("csgorpc_win.exe", (err) => { }) //and delete csgorpc_win.exe if it came from the build folder
                }

            })
        })
    })
}