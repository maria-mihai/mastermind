const gameboard = document.getElementById("gameboard")
const all_slots = document.getElementById("slots")
const pearls = document.getElementById("pearls")
const rows = Array.from(gameboard.querySelectorAll(".row"))
let slots = []
for (var i = rows.length - 1; i >= 0; i--) {
 	slots[i] = Array.from(rows[i].children)
}
all_slots.addEventListener('click', e => {
	console.log("slot",e.target.dataset)
})
pearls.addEventListener('click', e => {
	console.log("color",e.target.id)
})