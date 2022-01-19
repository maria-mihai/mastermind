const websocket = require("ws");

const game = function(gameID) {
	this.playerA = null;
	this.playerB = null;
	this.id = gameID;
	this.pattern = null;
	this.gameState = "0 JOINT";
}

game.prototype.states = {
	"0 JOINT": 0,
	"1 JOINT": 1,
	"2 JOINT": 2,
	"GUESS": 3,
	"A": 4,
	"B": 5,
	"ABORTED": 6
};

game.prototype.setPattern = function(p) {
	if (!(this.gameState == "1 JOINT" || this.gameState == "2 JOINT")) {
		return new Error(`Trying to set new pattern, but game status is: ${this.gameState}`)
	};
	this.pattern = p;
};
game.prototype.setStatus = function(w) {
	this.gameState = w;
	console.log("[STATUS] %s",this.gameState);
}

game.prototype.getPattern = function() {
	return this.pattern;
};

game.prototype.hasTwoConnectedPlayers = function() {
	return this.gameState == "2 JOINT";
};

game.prototype.addPlayer = function(p) {
  if (this.gameState != "0 JOINT" && this.gameState != "1 JOINT") {
    return new Error(
      `Invalid call to addPlayer, current state is ${this.gameState}`
    );
  }

  if (this.gameState == "0 JOINT") {
  	this.setStatus("1 JOINT");
  }
  else {
  	this.setStatus("2 JOINT");
  }

  if (this.playerA == null) {
    this.playerA = p;
    return "A";
  } else {
    this.playerB = p;
    return "B";
  }
};

module.exports = game;