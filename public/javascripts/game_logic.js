const gameboard = document.getElementById("gameboard")
const all_slots = document.getElementById("slots")
const pearls = document.getElementById("pearls")
const rows = Array.from(gameboard.querySelectorAll(".row"))
const white = "images/white.png" // 0
const teal = "images/teal.png" // 1
const yellow = "images/yellow.png" // 2
const red = "images/red.png" // 3
const green = "images/green.png" // 4
const purple = "images/purple.png" // 5
const black = "images/black.png" // 6
const orange = "images/orange.png" // 7
let userInput = [9,9,9,9]
let currentGuess = [9,9,9,9]
const pageA = document.getElementById("view1");
const pageB = document.getElementById("view2");
const pearlsForA = document.getElementById('Apearls');
const prompt = document.getElementById('prompt');
const patternSender = document.getElementById('pattern-sender');
const stateInfo = document.getElementById('state-info');
const stateInfo2 = document.getElementById('state-info-2');
let allButtons = Array.from(document.querySelectorAll("button"))
const answerRowElem = document.getElementById('answer_row')
let answer_slots = answerRowElem.querySelectorAll('img')
let secondUserIn = false;
const instructions = document.getElementById('instructions');
let crntBtn = allButtons[10]
const colorArray = ["images/white.png", "images/teal.png", "images/yellow.png", "images/red.png", "images/green.png", "images/purple.png", "images/black.png", "images/orange.png"];
let playerType = "";

let slots = []
let currentColor = ""
let currentRow = 10
let ready=false;

const attemptsEl = document.getElementById("attempts")
for (let i = rows.length - 1; i >= 0; i-- ) {
 	slots[i] = Array.from(rows[i].children)
}

let inputColors = [0,0,0,0,0,0,0,0]


let a = 0;
//const socket = new WebSocket(window.location.href.replace("http", "ws"))

const socket = new WebSocket(location.origin.replace(/^http/, 'ws'))

// socket.ws.on('open', function open() {
//   ws.send('something');
// });

socket.onopen = function () {
        socket.send("Hello from the client!");
        
      };
function parseForPattern(m) {
	//patternDDDD
	let pattern={};
	let digits = parseInt(m.substring(7));
	for(let i = 3; i >= 0; i--) {
		pattern[i] = digits % 10;
		digits = Math.floor(digits / 10);
	}
	return pattern;
}
socket.onmessage = function message(e) {
  /*const msg =  e.data.toString();
  console.log(msg);
  console.log(msg instanceof Blob);*/
  let msg="";
  if (e instanceof Blob) {
  	msg=e.text();
  }
  else {
  	msg=e.data.toString();
  }
console.log(msg);
  if (msg.startsWith("PlayerType")) {
  		playerType = msg.substring(10);
  		console.log(playerType);
  		if(playerType=="A"){
	  		pageA.style.display = "grid";
	  		//pageB.style.display = "none";}
	  		pearlsForA.addEventListener('click', e => {
				currentColor = e.target.id.substring(1);
				console.log(currentColor);
			});
	  		prompt.addEventListener('click',userAColorPicker);
	  		crntBtn.style.display="none";
	  		stateInfo.innerText="";
	  		patternSender.addEventListener('click', e => {
				let count = 0;
				for (let i = userInput.length - 1; i >= 0; i--) {
					if (userInput[i] < 8) {
						count++;
					}
				}
				if (count < 4) {
					window.prompt('Please fill all the slots!')
				}
				else {
					socket.send("pattern"+userInput[0]+userInput[1]+userInput[2]+userInput[3]);
					stateInfo2.innerText="Waiting for the other user to join.";
					patternSender.disabled = true;
					ready=true;
					if (secondUserIn) {
						pageA.style.display = "none";
						pageB.style.display = "grid";
						revealAnswer();
						instructions.innerHTML='Watch your friend try to guess your pattern.<br>For every correct color that is also in the right spot, they get one red pearl.<br>For every correct color that is in the wrong spot, they get one white pearl.';
					}
				}
			  })
		  }
		  else {
		  	pageB.style.display = "grid";
		  	console.log(userInput);
		  	console.log(userInput[0] === 9);
		  	if (userInput[0] === 9) {
		  		crntBtn.disabled="hidden";
		  	}
		  	else {
		  		crntBtn.addEventListener('click', buttonClicked)
		  	}	
		  	pearls.addEventListener('click', colorSetter);
		  	all_slots.addEventListener('click', slotFillerB);
		  }
	
}
else if (msg.startsWith("pattern")) {
		crntBtn.disabled=false;
		console.log(msg);
		userInput = parseForPattern(msg);
		stateInfo.innerText="";
		for (let i = 0; i <= 3; i++) {
			inputColors[userInput[i]]++
		}
		crntBtn.addEventListener('click', buttonClicked)
	}
else if (msg.startsWith("second")) {
	console.log("her1");
	secondUserIn = true;
	if(ready) {
		console.log("her2");
		pageA.style.display = "none";
		pageB.style.display = "grid";
		revealAnswer();
		instructions.innerHTML='Watch your friend try to guess your pattern.<br>For every correct color that is also in the right spot, they get one red pearl.<br>For every correct color that is in the wrong spot, they get one white pearl.';
}
}
else if(msg.startsWith("Winner")) {
	gameOver();
	console.log(playerType+" "+msg.substring(6));
	if (playerType == msg.substring(6)) {
		stateInfo.innerText="You win!";
	}
	else {
		stateInfo.innerText="You lose.";
	}
}
else if (msg.startsWith("Guess")) {
	let row = msg.substring(5,6);
	let column = msg.substring(6,7);
	let colorCode = msg.substring(7,8);
	slots[row][column].setAttribute("src", colorArray[colorCode]);
	slots[row][column].setAttribute("height","42px");
	currentGuess[column]=colorCode;
	currentRow = parseInt(row);

}
else if (msg.startsWith("CHECK")) {
	checkGuess();
}
else if (msg.startsWith("aborted")){
		stateInfo.innerText="your friend has left the game :("
		gameOver();
	}
}
const timer = document.getElementById("timer")
let time = 0
var timerInt = setInterval(updateTimer,1000)
function updateTimer() {
	let minutes = Math.floor(time/60)
	let seconds = time %60
	minutes = minutes < 10 ? '0' + minutes : minutes
	seconds = seconds < 10 ? '0' + seconds : seconds
	timer.innerText = minutes + ":" + seconds
	time++
}

function slotFillerB(e) {
	if (Array.from(e.target.classList).includes("slot") && e.target.dataset.row == currentRow) {
		if (currentColor.length > 0) {
			switch(currentColor) {
				case "white":
				e.target.setAttribute("src", white)
				currentGuess[e.target.dataset.column - 1] = 0
				socket.send("Guess"+(e.target.dataset.row-1)+(e.target.dataset.column-1)+0);
				break;
				case "teal":
				e.target.setAttribute("src", teal)
				currentGuess[e.target.dataset.column - 1] = 1
				socket.send("Guess"+(e.target.dataset.row-1)+(e.target.dataset.column-1)+1);
				break;
				case "yellow":
				e.target.setAttribute("src", yellow)
				currentGuess[e.target.dataset.column - 1] = 2
				socket.send("Guess"+(e.target.dataset.row-1)+(e.target.dataset.column-1)+2);
				break;
				case "red":
				e.target.setAttribute("src", red)
				currentGuess[e.target.dataset.column - 1] = 3
				socket.send("Guess"+(e.target.dataset.row-1)+(e.target.dataset.column-1)+3);
				break;
				case "green":
				e.target.setAttribute("src", green)
				currentGuess[e.target.dataset.column - 1] = 4
				socket.send("Guess"+(e.target.dataset.row-1)+(e.target.dataset.column-1)+4);
				break;
				case "purple":
				e.target.setAttribute("src", purple)
				currentGuess[e.target.dataset.column - 1] = 5
				socket.send("Guess"+(e.target.dataset.row-1)+(e.target.dataset.column-1)+5);
				break;
				case "black":
				e.target.setAttribute("src",black)
				currentGuess[e.target.dataset.column - 1] = 6
				socket.send("Guess"+(e.target.dataset.row-1)+(e.target.dataset.column-1)+6);
				break;
				case "orange":
				e.target.setAttribute("src", orange)
				currentGuess[e.target.dataset.column - 1] = 7
				socket.send("Guess"+(e.target.dataset.row-1)+(e.target.dataset.column-1)+7);
				break;
			}
			e.target.setAttribute("height","42px")
		}
	}
}


function colorPearls(redPearls, whitePearls) {
	let index = currentRow + 1
	let resultString = "result" + index
	console.log(resultString);
	let resultPearls = Array.from(document.getElementById(resultString).querySelectorAll("img"))
	for (let i = 0; i <= 3; i++) {
		if (redPearls > 0){
			resultPearls[i].setAttribute("src", red)
			redPearls--
		}
		else if (whitePearls > 0){
			resultPearls[i].setAttribute("src", white)
			whitePearls--
		}
	}

	//resultPearls[0].setAttribute("src", white)
}

function checkGuess() {
	let redPearls = 0
	let whitePearls = 0
	let userCopy = [userInput[0], userInput[1], userInput[2], userInput[3]]
	for (let i = 0; i <= 3; i++){
		if (currentGuess[i] == userCopy[i]){
			currentGuess[i] = -1;
			userCopy[i] = -1;
			redPearls++;
		}
	}
	for (let i = 0; i <= 3; i++){
		for (let j = 0; j <= 3; j++){
			if (currentGuess[i] == userCopy[j] && i != j && currentGuess[i] != -1) {
					whitePearls++;
				}
		}
	}
	if (redPearls == 4) {
		gameOver();
		allButtons[currentRow].style.display = "none";
		socket.send("WinnerB");
	}
	else {
		colorPearls(redPearls, whitePearls)
	}
}



function buttonClicked(){
	let count = 0
	for (let i = currentGuess.length - 1; i >= 0; i--) {
		if (currentGuess[i] < 8) {
			count++;
		}
	}
	if (count < 4) {
		window.alert('Please fill all the slots!')
		let count = 0
	for (let i = currentGuess.length - 1; i >= 0; i--) {
		if (currentGuess[i] < 8) {
			count++;
		}
	}
	}
	else {
		
		allButtons[currentRow].style.display = "none"
		
		if (currentRow > 1) {
			currentRow--;
			attemptsEl.innerText = currentRow
		}
		else {
			socket.send("WinnerA");

			}
		}
		allButtons[currentRow ].style.display = "inline-block"
		checkGuess();
		socket.send("CHECK");
		currentGuess = [9,9,9,9]
		allButtons[currentRow].addEventListener('click', buttonClicked)
	}


function userAColorPicker(e) {
	if (Array.from(e.target.classList).includes("slot")) {
		if (currentColor.length > 0) {
			switch(currentColor) {
				case "white":
				e.target.setAttribute("src", white)
				userInput[e.target.dataset.column - 1] = 0
				break;
				case "teal":
				e.target.setAttribute("src", teal)
				userInput[e.target.dataset.column - 1] = 1
				break;
				case "yellow":
				e.target.setAttribute("src", yellow)
				userInput[e.target.dataset.column - 1] = 2
				break;
				case "red":
				e.target.setAttribute("src", red)
				userInput[e.target.dataset.column - 1] = 3
				break;
				case "green":
				e.target.setAttribute("src", green)
				userInput[e.target.dataset.column - 1] = 4
				break;
				case "purple":
				e.target.setAttribute("src", purple)

				userInput[e.target.dataset.column - 1] = 5
				break;
				case "black":
				e.target.setAttribute("src",black)
				userInput[e.target.dataset.column - 1] = 6
				break;
				case "orange":
				e.target.setAttribute("src", orange)
				userInput[e.target.dataset.column - 1] = 7
				break;
			}
			e.target.setAttribute("height","42px")
			console.log(userInput);
		}
	}
}

function revealAnswer() {
	for (let i = answer_slots.length - 1; i >= 0; i--) {
			answer_slots[i].setAttribute("src",colorArray[userInput[i]]);
			answer_slots[i].setAttribute("height","42px")
		}
}
function colorSetter(e) {
	currentColor = e.target.id;
}
function gameOver() {
	revealAnswer();
	clearInterval(timerInt);
	crntBtn.disabled=true;
	crntBtn.removeEventListener('click', buttonClicked);
	all_slots.removeEventListener('click', slotFillerB);
	pearls.removeEventListener('click', colorSetter);
	socket.send("STAT"+time);
}
