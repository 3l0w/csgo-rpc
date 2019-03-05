const compile = require("nexe").compile
const fs = require("fs")
const exec = require("child_process").execSync
try {
    fs.mkdirSync("build")
} catch (error) { }
compile({
    input: "./index.js",
    targets: "win",
    output: "./build/csbuild.exe",
    debugBundle: true
}).then(() => {
    exec("buildtools\\ResourceHacker.exe -open build\\csbuild.exe -save build\\csgorpc_win.exe -action addoverwrite -res img\\csgo_icon.ico -mask ICONGROUP,IDR_MAINFRAME", { windowsHide: true })
    fs.unlinkSync("./build/csbuild.exe")

})
compile({
    input: "./index.js",
    targets: "linux",
    output: "./build/csgorpc_linux"
})
compile({
    input: "./install_linux.js",
    targets: "linux",
    output: "./build/install_linux"
})
compile({
    input: "./install_windows.js",
    targets: "win",
    output: "./build/installbuild.exe",
    verbose: true,
}).then(() => {
    exec("buildtools\\ResourceHacker.exe -open build\\installbuild.exe -save build\\install_win.exe -action addoverwrite -res img\\install.ico -mask ICONGROUP,IDR_MAINFRAME", { windowsHide: true })
    fs.unlinkSync("./build/installbuild.exe")
})