const pickBox = [
	"red panda", "green panda", "blue panda", "yellow panda",
	"red giraffe", "green giraffe", "blue giraffe", "yellow giraffe",
	"red owl", "green owl", "blue owl", "yellow owl",
	"red cat", "green cat", "blue cat", "yellow cat", "blank"
];
let board = {};
let aniIMG = {};
let solution;
let tempInp = null;
let imgSize;
let cnv;
let dsp;
let sols=[];
let backIMG;
let titleIMG;
let myButton;

class Animal {
	constructor (name, x, y) {
		this.name = name;
		this.x = x;
		this.y = y;
	}
}

function preload () {
	for (let str of pickBox) {
	let ani = loadImage("img/" + str + ".png");
	aniIMG[str] = ani;
	}
	titleIMG = loadImage("img/titleIMG.png");
	backIMG = loadImage("img/backIMG1.png");
}

function setup() {
	cnv = createCanvas(windowWidth, windowHeight * 0.9).parent('cnvcon');
	dsp = createP("Welcome to Animal Logic").class("dsp").parent('dspcon');
	if (windowWidth >= 750) {
		cnv.size(windowHeight*0.6,windowHeight*0.9);
		dsp.style('font-size','170%');
	}
	imgSize = Math.min(cnv.width/6.5, cnv.height/6.5);
	openingPage();
}

function openingPage () {
	background(titleIMG);
	myButton = createButton("START GAME").class("button").mousePressed(startGame);
	if (windowWidth >= 750) {
		myButton.style('width','30%');
		myButton.width = windowWidth*0.3;
		myButton.style('font-size','40px');
	} else {
	myButton.width = windowWidth*0.5;
	}
	myButton.position((windowWidth - myButton.width)/2, windowHeight/2.2);
	
}

function startGame () {
	solution = [];
	myButton.remove();
	makeBoard();
	renderBoard();
	tempInp = null;
	dsp.html('Pick an animal from the front row');
}

function range (from, to, interval = 1) {
	let retArr = [];
	for (let i = from; i <= to; i += interval) {
		retArr.push(i);
	}
	return retArr;
}

function makeBoard () {
	let set = range(0, 15);
	let tempRow = [];
	let j = 0;
	for (i = 0; i < 4; i++) {
		let aniIndex = Math.floor(Math.random()*16);
		if (!set.includes(aniIndex)) {
			i--;
		} else {
			let imgX = cnv.width*(0.26*i+0.04);
			let imgY = cnv.height*(0.8 - (0.2*(j+1)))
			let ani = new Animal(pickBox[aniIndex], imgX, imgY);
			tempRow.push(ani);
			set.splice(set.indexOf(aniIndex), 1);
			j++;
			if (tempRow.length === 4) {
				board[i] = tempRow;
				tempRow = [];
				j = 0;
			} else {
				i--;
			}
		}
	}
}

function mouseReleased () {
	if (tempInp === null) {
		let yRange = cnv.height*0.6;
		if (mouseY >= yRange && mouseY <= yRange + imgSize) {
			for (i = 0; i < 4; i++) {
				xRange = cnv.width*(0.26*i+0.04);
				if (mouseX >= xRange && mouseX <= xRange + imgSize && board[i].length >= 1) {
					tempInp = board[i][0].name;
					processInput(i);
				}
			}
		}
	}
}

function renderCol (col) {
	for (i=0; i<col.length; i++){
		image(aniIMG[col[i].name], col[i].x, col[i].y, imgSize, imgSize);
		
	}
}

function renderBoard () { 
	background(backIMG);
	for (p in board){
		renderCol(board[p]);
		}
	}

	// p: property in the board(0-3). board[p] = [Animal in that column] 
function rePostionCol (p) {
	for (i=0; i<board[p].length; i++){
		board[p][i].y = cnv.height*(0.8 - 0.2*(i+1));
	}
}

function renderAnimation(i) {
	let fromX = cnv.width*(0.26*i+0.04);
	let fromY = cnv.height*0.6;
	let destX = (cnv.width-imgSize)/2;
	let destY = cnv.height-(imgSize + 10);
	let exp = 1;
	let moveAni = setInterval(() => {
		exp += 0.22;
		renderBoard();
		if (i < 2){
			fromX += 5-i*3;
			if (fromX > destX) fromX = destX;
		} else {
			fromX -= 3*i-4;
			if (fromX < destX) fromX = destX;
		}
		fromY += Math.floor(exp*exp/4); 
		if (fromY > destY) fromY = destY;
		if (solution.length > 1) {
			image(aniIMG[solution[solution.length-2]], destX , destY , imgSize, imgSize);	
		}
		image(aniIMG[solution[solution.length-1]], fromX , fromY , imgSize, imgSize);
		if (fromX === destX && fromY === destY) {
			clearInterval(moveAni);
			board[i].shift();
			rePostionCol(i);
			renderBoard();
			image(aniIMG[solution[solution.length-1]], fromX , fromY , imgSize, imgSize);
			console.log("clearInteval called.");
			checkGameState();
		}
	}, 15);
}

function makeFirstRow (bd) {
	firstRow = [];
	for (i = 0; i < 4; i++) {
		bd[i].length === 0 ? firstRow.push("blank blank") : firstRow.push(bd[i][0].name);
	}
	return firstRow;
}

function checkGameState () {
	if (solution.length === 16) { 
		dsp.html("Yay! All animals made it!");
		playAgain();
	} else if (solution.length != 0 && !isConnection(solution[solution.length-1], makeFirstRow(board))) {
		dsp.html("Oh no.. No more choice left!");
		playAgain();
	} else {
		dsp.html("Well done! Who's next?");
		tempInp = null;
	}
}

function playAgain() {
	myButton = createButton("PLAY AGAIN").class("button").mousePressed(startGame);
	if (windowWidth >= 750) {
		myButton.style('width','30%');
		myButton.width = windowWidth*0.3;
		myButton.style('font-size','40px');
	} else {
	myButton.width = windowWidth*0.5;
	}
	myButton.position((windowWidth - myButton.width)/2, windowHeight/2.2);
}

function isConnection (aniName, row) {
	let keys = aniName.split(" ");
	return row.some(each => {
			return isSameColorOrType(aniName, each);
	});
}

function isSameColorOrType (aniName1, aniName2) {
	let keys = aniName1.split(" ");
	return aniName2.includes(keys[0]) || aniName2.includes(keys[1]);
};

// (aniName, firstRow) => [bool, bool, bool, bool], bool is true if there's connection in that col
function findConnections (aniName, row) {
	let connections = [];
	for (i=0; i<4; i++){
		isSameColorOrType(aniName, row[i]) ? connections.push("t") : connections.push("f");
	}
	return connections;
}

function solve (bd, currSol) {
	if (bd === null && currSol === null) {
		return null;
	} else if (currSol.length === 0) {
		let nexts = ["t", "t", "t", "t"];
		solveNextTurn (bd, currSol, nexts);
	} else if (currSol.length === 16) {
		sols.push(currSol);
		return null;
	} else {
		let firstRow = makeFirstRow(bd);
		let prevAni = currSol[currSol.length-1];
		if (!isConnection(prevAni, firstRow)) {
			return null;
		} else {
			let nexts = findConnections(prevAni, firstRow);
			solveNextTurn (bd, currSol, nexts);
		}
	} 
}

function solveNextTurn (bd, currSol, nexts) {
	let prevBd = JSON.parse(JSON.stringify(bd));
	let prevCurrSol = currSol.slice();
	let bds = [];
	let currSols = [];
	for (i=0; i<4; i++){
		bd = JSON.parse(JSON.stringify(prevBd));
		currSol = prevCurrSol.slice();
		if (nexts[i] === "t") {
			currSol.push(bd[i][0].name);
			currSols.push(currSol);
			bd[i].shift();
			bds.push(bd);
			console.log("currsol : " + currSol + " first in next row : " + bd[0]);
		} else {
			currSols.push(null);
			bds.push(null);
		}
	}
	return solve(bds[0], currSols[0]) || solve(bds[1], currSols[1]) || solve(bds[2], currSols[2]) || solve(bds[3], currSols[3]);
}

function processInput(boardIndex) {
		if (solution.length === 0 || isConnection(tempInp, [solution[solution.length-1]])) {
			dsp.html(tempInp + " crossing!");
			solution.push(tempInp);
			board[boardIndex][0].name = "blank";
			renderAnimation(boardIndex);
			} else {
				let ins = solution[solution.length-1].split(" ");
				dsp.html("Pick either " + ins[1] + " or " + ins[0] + " color");
				setTimeout(() => tempInp = null, 500);
			}
}
