const http = require('http');
const fs = require("fs")
const port = 3000;
const host = '127.0.0.1';
const clientId = '547104228276174869';
const DiscordRPC = require("discord-rpc")
DiscordRPC.register(clientId);
var rpc = new DiscordRPC.Client({ transport: 'ipc' });
var time
rpc.on('ready', () => {
    console.log('Authed for user', rpc.user.username);
});
rpc.connect(clientId)

server = http.createServer(function (req, res) {
    if (req.method == 'POST') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var body = '';
        req.on('data', function (data) {
            body = JSON.parse(data);
        });
        req.on('end', function () {
            console.log(body);
            //  fs.writeFileSync("data.json", JSON.stringify(body))
            setRpcActivity(body)
            res.end('');
        });
    }
    else {
        console.log("Not expecting other request types...");
        res.writeHead(200, { 'Content-Type': 'text/html' });
        var html = '<html><body>HTTP Server at http://' + host + ':' + port + '</body></html>';
        res.end(html);
    }

});
var menu = false
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);

function setRpcActivity(data) {
    var activity = {
        //  details: "",
        //state: "",
        largeImageKey: "icon",
        largeImageText: "csgo",
        instance: false

    }
    if (data.player.state === undefined) {
        time = undefined
        activity.details = "Dans les menus"
        if (menu === false) {
            menu = true
            var activity = {
                details: "Dans les menus",
                largeImageKey: "icon",
                largeImageText: "csgo",
                instance: false,
                startTimestamp: new Date()

            }
        }
    }
    if (data.player.state) {
        if (time === undefined) {
            time = new Date()
            menu = false
        }
        if (data.player.team == "CT") { var team = "ct" } else { var team = "t" }
        if (data.round.phase === "live") {
            var phase = "Live"
        } else if (data.round.phase == "freezetime") {
            var phase = "Freeze Time"
        } else {
            var phase = "Round Over"
        }
        if(data.map.mode === "deathmatch"){
            var state = phase
        }else{
        var state = data.map.team_ct.score + " - " + data.map.team_t.score + ", " + phase
        }
        if (data)
            var activity = {
                details: data.map.mode[0].toUpperCase() + data.map.mode.slice(1) + ", " + data.player.match_stats.kills + "/" + data.player.match_stats.assists + "/" + data.player.match_stats.deaths,
                state: state,
                largeImageKey: data.map.name,
                largeImageText: data.map.name,
                smallImageKey: team,
                instance: false,
                startTimestamp: time

            }
    }
    rpc.setActivity(activity)
}
rpc.login({ clientId: clientId })