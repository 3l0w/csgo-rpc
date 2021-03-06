const compile = require("nexe").compile
const fs = require("fs")
const exec = require("child_process").execSync
var AdmZip = require('adm-zip');
try { //if build dont exist create folder
    fs.mkdirSync("build")
} catch (error) { }
compile({ //build csgorpc_win.exe
    input: "./index.js",
    targets: "win",
    output: "./build/csbuild.exe",
    debugBundle: true
}).then(() => {
    if (process.platform === "win32") {
        exec("tools\\ResourceHacker.exe -open build\\csbuild.exe -save build\\csgorpc_win.exe -action addoverwrite -res img\\csgo_icon.ico -mask ICONGROUP,IDR_MAINFRAME", { windowsHide: true })
        //set an icon for the exe
        fs.unlinkSync("./build/csbuild.exe")
    } else if (process.platform === "linux") {
        exec("wine tools\\ResourceHacker.exe -open build\\csbuild.exe -save build\\csgorpc_win.exe -action addoverwrite -res img\\csgo_icon.ico -mask ICONGROUP,IDR_MAINFRAME", { windowsHide: true })
        //set an icon for the exe
        fs.unlinkSync("./build/csbuild.exe")
    }
    compile({ //build install_windows.js
        input: "./install_window.js",
        targets: "win",
        output: "./build/installbuild.exe",
        debugBundle: true
    }).then(() => {
        if (process.platform === "win32") {
            exec("tools\\ResourceHacker.exe -open build\\installbuild.exe -save build\\install_win.exe -action addoverwrite -res img\\install.ico -mask ICONGROUP,IDR_MAINFRAME", { windowsHide: true })
            //set an icon for the exe
            fs.unlinkSync("./build/installbuild.exe")
        } else if (process.platform === "linux") {
            exec("wine tools\\ResourceHacker.exe -open build\\installbuild.exe -save build\\install_win.exe -action addoverwrite -res img\\install.ico -mask ICONGROUP,IDR_MAINFRAME", { windowsHide: true })
            //set an icon for the exe
            fs.unlinkSync("./build/installbuild.exe")
        }
        var zip = new AdmZip();
        zip.addLocalFile("./build/csgorpc_win.exe")
        zip.addLocalFile("./build/install_win.exe");
        zip.writeZip("./build/csgorpc_win.zip");
    })
})
compile({ //build csgorpc_linux
    input: "./index.js",
    targets: "linux",
    output: "./build/csgorpc_linux"
}).then(() => {
    compile({ //build install_linux
        input: "./install_linux.js",
        targets: "linux",
        output: "./build/install_linux"
    }).then(() => {
        var zip = new AdmZip();
        zip.addLocalFile("./build/csgorpc_linux")
        zip.addLocalFile("./build/install_linux");
        zip.writeZip("./build/csgorpc_linux.zip");
    })
})


