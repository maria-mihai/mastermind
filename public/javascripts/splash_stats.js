const express = require('express');
const gameStatus = require('./stats');

const shortestTimeStat = document.getElementById('shortest-time-stat');
const noOfGamesStat = document.getElementById('no-of-games-stat');
const aWinsStat = document.getElementById('a-wins-stat');

let percentage = (gameStatus.aWins / gameStatus.gamesInitialized) * 100;
let minutes = Math.floor(gameStatus.shortestTime / 60);
let seconds = gameStatus.shortestTime % 60;

shortestTimeStat.innerText='${minutes}:${seconds}';
noOfGamesStat.innerText=gameStatus.gamesInitialized;
aWinsStat.innerText=gameStatus.aWins