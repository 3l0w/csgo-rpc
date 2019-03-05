const fs = require("fs")
const drives = require("windows-drive-letters")
const wget = require("node-wget")
const prompt = require("promptly")
const copyfiles = require('copyfiles');
const isElevated = require('is-elevated');
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
let length = [0, 0, false]

isElevated().then(elevated => { //check if admin permission are available
    if (!elevated) {
        console.log("You launch the installer without adminstrator permission \nIf you csgo is install in a proteted folder, launch as administrator")
    }
});
drives.usedLetters().then((letters) => { //get all conected disk
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
                                    console.log("Installing the config file in " + folder + "\\" + element + " ...")
                                    wget("http://51.75.27.87/gamestate_integration_discordrpc.cfg", () => { //download the config
                                        copyfiles(["gamestate_integration_discordrpc.cfg", folder + "\\" + element], (err) => { //copy the config
                                            fs.unlinkSync("gamestate_integration_discordrpc.cfg") //delete the config
                                        })
                                        console.log("done!")
                                        length[2] = true
                                        end()
                                    })

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
            fs.copyFileSync("gamestate_integration_discordrpc.cfg", folder) //copy the config
            fs.unlinkSync("gamestate_integration_discordrpc.cfg") //delete the config
            console.log("done!")
        })
    }
    if (length[0] === length[1]) { //if all disk are checked
        console.log('Press any key to exit');
        process.stdin.setRawMode(true);
        process.stdin.resume(); //Pause
        process.stdin.on('data', process.exit.bind(process, 0)); //exit
    }
}