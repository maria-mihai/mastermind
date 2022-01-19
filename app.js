const http = require('http');
const express = require('express');
const app = express();
const websocket = require("ws");
const Game = require("./game");
const gameStatus = require('./stats');

app.use(express.static(__dirname + "/public"));
/*
app.get('/',(req,res) => {
  res.sendFile('index.html');
});
*/
app.get('/play', (req,res)=> {
  res.sendFile('game.html', { root: "./public" });
});

app.get("/", function(req, res) {
  res.render("index.ejs", {
  	shortestTime: gameStatus.shortestTime,
    gamesInitialized: gameStatus.gamesInitialized,
    aWins: gameStatus.aWins
  });
});

let websockets = {};

const server = http.createServer(app);

const wss = new websocket.Server({server});

let currentGame = new Game(gameStatus.gamesInitialized++);
let connectionID = 0;

if(process.argv.length < 3) {
  console.log("Error: expected a port as argument (eg. 'node app.js 3000').");
  process.exit(1);
}
const port = process.argv[2];

function parseForPattern(m) {
	//patternDDDD
	let pattern={};
	let digits = parseInt(m.substring(7));
	for(let i = 3; i >= 0; i--) {
		pattern[i] = digits % 10;
		digits = digits / 10;
	}
	return pattern;
}

wss.on("connection", function (ws) {
  /*
   * let's slow down the server response time a bit to
   * make the change visible on the client side
   */
   console.log("Connection opened");
   console.log(gameStatus.aWins);
  const con = ws;
  con["id"] = connectionID++;
  const playerType = currentGame.addPlayer(con);

  websockets[con["id"]] = currentGame;
  console.log(`Player ${con["id"]} placed in game ${currentGame.id} as ${playerType}`);

  con.send(playerType == "A"? "PlayerTypeA" : "PlayerTypeB");
  if (playerType == "B" && currentGame.getPattern() != null) {
  	con.send(currentGame.getPattern());
  }
  if (currentGame.hasTwoConnectedPlayers()) {
  	currentGame = new Game(gameStatus.gamesInitialized++);
  	console.log("Second player joined.");
    websockets[con["id"]].playerA.send("second player joined");
  }
  con.on("close", function(code) {
    console.log(`${con["id"]} disconnected ...`);
    websockets[con["id"]].playerA.send("aborted");
    websockets[con["id"]].playerB.send("aborted");
  });
  con.on("message", function incoming(message) {
    console.log("[LOG] " + message);
    const gameObj = websockets[con["id"]];
    const isPlayerA = gameObj.playerA == con ? true : false;
    if (isPlayerA) {
      if (message.toString().startsWith("pattern")) {
        console.log("here");
        console.log(""+message);
        gameObj.setPattern(""+message);

        if (gameObj.hasTwoConnectedPlayers()) {
          gameObj.playerB.send(""+message);
        }
      }
    }
    else {
      if(message.toString().startsWith("Winner")) {
        gameObj.setStatus(message.toString().substring(6));
        gameObj.playerA.send(""+message);
        gameObj.playerB.send(""+message);
        if (message.toString().substring(6) == "A") {
        	gameStatus.aWins++;
        }
      }
    }
    if (message.toString().startsWith("STAT")) {
      	let crntTime = parseInt(message.toString().substring(4));
      	if (gameStatus.shortestTime > crntTime || gameStatus.shortestTime == 0) {
      		gameStatus.shortestTime = crntTime;
      	}
      }
     if (message.toString().startsWith("Guess") || message.toString().startsWith("CHECK")) {
     	gameObj.playerA.send(""+message);
     }
  });
});


server.listen(port);