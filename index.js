const http = require('http');
const fs = require("fs")
const port = 3000;
const host = '127.0.0.1';
const clientId = '547104228276174869';
const DiscordRPC = require("discord-rpc")
DiscordRPC.register(clientId);
var rpc = new DiscordRPC.Client({ transport: 'ipc' });
var time


rpc.on('ready', () => {         //When rp is connected, send the username in the console
    console.log('Authed for user', rpc.user.username);
});
rpc.connect(clientId)           //Connect the rp with the application



server = http.createServer(function (req, res) {        //Create the server who listen to csgo's stats
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
var menu = false;
server.listen(port, host);
console.log('Listening at http://' + host + ':' + port);


function setRpcActivity(data) {         //Set Rp activity
    var activity = {                    //This var is sent to discord, it will display you stats
        //  details: "",
        //state: "Live", "Freezetime" or "End round"
        //team: "ct" or "t"
        largeImageKey: "icon",
        largeImageText: "csgo",
        instance: false

    }


    if (data.player.state === undefined) {      //If the player isnt in a game, set the stats as below
        time = undefined
        activity.details = "In menu"
        if (menu === false) {
            menu = true
            var activity = {
                details: "In menu",
                largeImageKey: "icon",
                largeImageText: "csgo",
                instance: false,
                startTimestamp: new Date()

            }
        }
    }


    if (data.player.state) {        //If data.player.state isnt null, set activity with the stats below
        
        if (time === undefined) {   //If the match doesnt have time code, it create one
            time = new Date()
            menu = false
        }
        if(data.map.mode == "gungameprogressive"){
            var details = "Gungame" + ", " + data.player.match_stats.kills + "/" + data.player.match_stats.assists + "/" + data.player.match_stats.deaths
        }else{
            var details = data.map.mode[0].toUpperCase() + data.map.mode.slice(1) + ", " + data.player.match_stats.kills + "/" + data.player.match_stats.assists + "/" + data.player.match_stats.deaths
        }
        if (data.player.team == "CT") { var team = "ct" } else { var team = "t" }
        if (data.round.phase === "live") {
            var phase = "Live"
        } else if (data.round.phase == "freezetime") {      //Set the match state as freezetime
            var phase = "Freeze Time"
        } else {                                            //Set the match state as round over
            var phase = "Round Over"
        }
        if (data.map.mode === "deathmatch") {
            var state = phase
        } else if (data.map.mode === "gungameprogressive") {
            var state = phase
        } else {
            var state = data.map.team_ct.score + " - " + data.map.team_t.score + ", " + phase
        }



        if (data)  //If data isnt null, set the missing fields for every gamemode (such as the map, the team, etc...)
            var activity = {
                details: details,
                state: state,
                largeImageKey: data.map.name,
                largeImageText: data.map.name,
                smallImageKey: team,
                instance: false,
                startTimestamp: time

            }
    }


    rpc.setActivity(activity) //set activity




}
rpc.login({ clientId: clientId })