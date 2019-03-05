const fs = require("fs")
const wget = require("node-wget")
const prompt = require("promptly")
var length = [0, 0, false]
search("/")
function search(folder) {
    const dir = fs.readdirSync(folder)
    for (let i = 0; i < dir.length; i++) {
        const element = dir[i];
        try {
            let stats = fs.statSync(folder + "/" + element)
            if (stats) {
                if (stats.isDirectory()) { //check if this is a file or a folder
                    if ((folder + "/" + element).includes("common/Counter-Strike Global Offensive/csgo/cfg")) { //check if the Path containt the csgo cfg folder 
                        let foldsplit = (folder + "/" + element).split("/")
                        if (foldsplit[foldsplit.length - 1] === "cfg") {
                            console.log("Installing the config file in " + folder + "/" + element + " ...")
                            wget("http://51.75.27.87/gamestate_integration_discordrpc.cfg", () => { //download the config
                                copyfiles(["gamestate_integration_discordrpc.cfg", folder + "/" + element], (err) => { //copy the config
                                    fs.unlinkSync("gamestate_integration_discordrpc.cfg") //delete the config
                                })
                                console.log("done!")
                                length[2] = true
                                end()
                            })
                        }
                    }
                    search(folder + "/" + element) //check for the next folder
                }
            }
        } catch (error) {

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