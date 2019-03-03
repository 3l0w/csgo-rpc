const compile = require("nexe").compile
const fs = require("fs")
try {
    fs.mkdirSync("build")
} catch (error) { }
compile({
    input: './index.js',
    targets: "win",
    cwd: "build/",
    output: "csgorpc.exe"
})
compile({
    input: './index.js',
    targets: "linux",
    cwd: "build/",
    output: "csgorpc"
})
compile({
    input: './install_linux.js',
    targets: "linux",
    cwd: "build/",
    output: "install_linux"
})
compile({
    input: './install_window.js',
    targets: "win",
    cwd: "build/",
    output: "install_window.exe"
})