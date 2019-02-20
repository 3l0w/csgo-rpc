const http = require('http');
const fs = require("fs")
const port = 3000;
const host = '127.0.0.1';
const clientId = '547104228276174869';
const DiscordRPC = require("discord-rpc")
const maplist = require("./maplist.json")
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
            if (data) {
                try {
                     body = JSON.parse(data) //If data can be parsed the parse and store in body
                } catch (error) {
                     console.log(error)
                }            
               
            }

        });
        req.on('end', function () {
            console.log(body);
            if (body) {                     //If body are not undefined then set the activity
                setRpcActivity(body)
            }
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
var menutime
function setRpcActivity(data) {         //Set Rp activity
    var activity = {} //This var is sent to discord, it will display you stats

    if (data.player.state === undefined) {    //If the player isnt in a game, set the stats as below
        if (menu === false) {     //If the menu doesnt have time code, it create one
            menu = true
            menutime = new Date()
        }
        activity = {
            details: "In menu",
            largeImageKey: "icon",
            largeImageText: "Counter-Strike Global Offensive",
            instance: false,
            startTimestamp: menutime
        }
        time = undefined

    }


    if (data.player.state) {        //If data.player.state isnt null, set activity with the stats below
        if (data.player.team == "CT") {
            var score = data.map.team_ct.score + " - " + data.map.team_t.score //set 1st team score for the player team
        } else {
            var score = data.map.team_t.score + " - " + data.map.team_ct.score
        }
        if (time === undefined) {   //If the match doesnt have time code, it create one
            time = new Date()
            menu = false
        }
        if (data.map.mode == "gungameprogressive") {
            var details = "Gungame" + ", " + data.player.match_stats.kills + "/" + data.player.match_stats.assists + "/" + data.player.match_stats.deaths
        } else if (data.map.mode == "scrimcomp2v2") {
            var details = "Wingman" + ", " + data.player.match_stats.kills + "/" + data.player.match_stats.assists + "/" + data.player.match_stats.deaths
        } else {
            var details = data.map.mode[0].toUpperCase() + data.map.mode.slice(1) + ", " + data.player.match_stats.kills + "/" + data.player.match_stats.assists + "/" + data.player.match_stats.deaths
        }
        if (data.player.team == "CT") {
            var team = "ct"
        } else {
            var team = "t"
        }
        if (data.round === undefined) {                     //Set the match state as Warmup
            var phase = "Warmup"
        } else if (data.round.phase == "freezetime") {      //Set the match state as freezetime
            var phase = "Freeze Time"
        } else if (data.round.phase === "live") {
            var phase = "Live"
        } else {                                            //Set the match state as round over
            var phase = "Round Over"
        }
        if (data.map.mode === "deathmatch") {               //Set special state for deathmatch
            var state = phase
        } else if (data.map.mode === "gungameprogressive") {
            var state = phase                               //Same for Gungame
        } else {
            var state = score + ", " + phase
        }
        if (data.map.name === "de_shortnuke") {
            map = "de_nuke"                        //set de_nuke image for nuke wingman version
        } else {
            map = data.map.name
        }
        if (maplist.indexOf(map) === -1) {
            map = "icon"                    //If the program don't know a map then set map icon as csgo icon
        } else {
            maptext = map
        }


        if (data)  //If data isnt null, set the missing fields for every gamemode (such as the map, the team, etc...)
            var activity = {
                details: details,
                state: state,
                largeImageKey: map,
                largeImageText: maptext,
                smallImageKey: team,
                instance: false,
                startTimestamp: time

            }
    }


    rpc.setActivity(activity) //set activity


}
rpc.login({ clientId: clientId })