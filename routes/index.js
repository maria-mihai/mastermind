const express = require("express");
const router = express.Router();

//const gameStatus = require("../statTracker");

//GET home page 
router.get("/", function(req, res) {
  res.sendFile("splashscreen.html", { root: "./public" });
});


/* Pressing the 'PLAY' button, returns this page 
router.get("/play", function(req, res) {
  res.sendFile("index.html", { root: "./public" });
});*/

/* GET home page 
router.get("/", function(req, res) {
  res.render("splash.ejs", {
    gamesInitialized: gameStatus.gamesInitialized,
    gamesCompleted: gameStatus.gamesCompleted
  });
}); */

module.exports = router;
