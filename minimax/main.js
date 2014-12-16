var canvas;
var context;
var width;
var height;
var cell = new Array();
var status_text;

var leaf_count_init = "N/A";

var player = 1;
var computer = 2;

var playing=true;

var s_size = 50;

var neg_infinity = -Number.MAX_VALUE;

//Declared for loading the document, canvas, et al, and initiating drawing
function start() {
	canvas = document.getElementById("canvas");
	context = canvas.getContext('2d');
	status_text = document.getElementById('status');
	score_text = document.getElementById('score');
	count_text = document.getElementById('count');

	init();
}

//Check for empty (used for abstraction and making the snippets more understandable)
function isEmpty(x) {
	return cell[x]==0;
}

function next_move() {
	//Set best as lowest possible
	var best = {score:neg_infinity, move:-1}
	
	//Temporary variable for score
	var temp_score = 0;

	//Counter for the label
	leaf_count=0;
	
	for(var i=0; i<9; i++) {
		if(isEmpty(i)) {
			//Make possible move
			cell[i]=computer;
			temp_score = -negaMax(player);
			cell[i]=0;

			//Take greatest score and move
			if(temp_score > best.score) {
				best.move = i;
				best.score = temp_score;
			}
		}
	}
	
	//Set label values
	setScore(best.score);
	setCount(leaf_count);

	//Perform best computed move
	cell[best.move] = computer;

	//Draw move performed
	var a = drawCoord(best.move);
	drawO(a.x, a.y);

	//Check for win
	if(checkWin()==computer) {
		playing = false;
		setStatus("YOU LOST");
	}
}


function negaMax(side) {
	//Check and add accordingly for possible win
	var a = checkWin();
	if(a>0) {
		leaf_count++;
		if(a==side) return 1;
		else return -1;
	}

	//Check and add accordingly for possible tie
	if(checkTie()) {
		leaf_count++;
		return 0;
	} 

	//Initiate temporary variables
	var max = neg_infinity;
	var temp_score = 0;


	//Perform and compute all further possible moves
	for(var i=0; i<9; i++) {
		if(isEmpty(i)){
			//Do possible move
			cell[i]=side;

			if (side==player) {
				next_side = computer;
			}
			else{
				next_side = player;
			}
			
			temp_score = -negaMax(next_side);
			cell[i]=0;

			if(temp_score > max) {
				max = temp_score;
			}
		}
	}
	return max;
}


//Initialize all of the labels and the board
function init() {
	playing = true;

	width = 400;
	height = 400;
	leaf_count = 0;

	setCount(leaf_count_init);
	setScore("NEGATIVE INFINITY");
	setStatus("Ready To Begin.")

	for(var i=0; i<9; i++)
		cell[i]=0;

	drawCanvas();
}

//Clear the board
function reset() {
	context.clearRect(0, 0, width, height);
	init();
}

//Function to draw the "X" (pass in the center point)
function drawX(x, y) {
	context.beginPath();
	context.strokeStyle="#c52033";
	context.lineWidth = 3.;

	context.moveTo(x-s_size/2, y-s_size/2);
	context.lineTo(x+s_size/2, y+s_size/2);

	context.moveTo(x-s_size/2, y+s_size/2);
	context.lineTo(x+s_size/2, y-s_size/2);

	context.stroke();

	context.closePath();
}

//Function to draw "O" (also pass in the center point) 
function drawO(x, y) {
	context.beginPath();

	context.strokeStyle="#000000";
	context.lineWidth=3.;

	context.arc(x, y, s_size/2,
		0, 2*Math.PI, false);

	context.stroke();

	context.closePath();
}

//Draw the canvas
function drawCanvas() {
	context.beginPath();

	context.strokeStyle= "silver";
	context.lineWidth = 2;

	context.moveTo(width/3, 0);
	context.lineTo(width/3, height);
	context.stroke();


	context.moveTo(width*2/3, 0);
	context.lineTo(width*2/3, height);
	context.stroke();


	context.moveTo(0, height/3);
	context.lineTo(width, height/3);
	context.stroke();


	context.moveTo(0, height*2/3);
	context.lineTo(width, height*2/3);
	context.stroke();
}

//Get the location of the center of the cell
function drawCoord(cell_clicked) {
	var x = (cell_clicked%3)*133+67;
	var y = (Math.floor(cell_clicked/3))*133+67;
	
	return {x:x,y:y};
}

function onClick(click) {
	if(!playing) return;
	setStatus("PLAYING.")
	var boundRect = canvas.getBoundingClientRect();
	var pos = {x: click.clientX - boundRect.left, y: click.clientY - boundRect.top};
	var cell_clicked = Math.floor(3*pos.x/width) + 3*Math.floor(3*pos.y/height);

	if(isEmpty(cell_clicked)) {
		cell[cell_clicked] = 1;
		var a = drawCoord(cell_clicked);
		drawX(a.x, a.y);
		if(checkWin()==player) {
		playing = false;
		setStatus("YOU WON.");
	}
	else if(checkTie()) {
		playing = false;
		setStatus("TIE");
	}
	else
		next_move();
	}
	
}

//Check which side wins
function checkWin() {
	// center cell
	if(cell[4]!=0) {
		if(cell[4]==cell[8] && cell[4]==cell[0])
			return cell[4];
		else if(cell[4]==cell[2] && cell[4]==cell[6])
			return cell[4];
		else if(cell[1]==cell[4] && cell[4]==cell[7])
			return cell[4];
		else if(cell[3]==cell[4] && cell[4]==cell[5])
			return cell[4]
	}
	// top left
	if(cell[0]!=0) {
		if(cell[1]==cell[0] && cell[0]==cell[2])
			return cell[0];
		if(cell[0]==cell[3] && cell[0]==cell[6])
			return cell[0]
	}
	// top right
	if(cell[2]!=0) {
		if(cell[2]==cell[5] && cell[8]==cell[5])
			return cell[2];
	}
	// bottom left
	if(cell[6]!=0) {
		if(cell[7]==cell[8] && cell[6]==cell[7])
			return cell[6];
	}
	return 0;
}

//Check for a tie. Run only after checking for a winner
function checkTie() {
	for(var i=0; i<9; i++) {
		if(cell[i]==0) return false;
	}
	return true;
}


//Functions for statuses
function setStatus(x) {
	status_text.innerHTML="<b>Game Status:</b> "+x;
}
function setScore(x) {
	score_text.innerHTML="<b>Computer's Min Score:</b> "+x;
}
function setCount(x) {
	count_text.innerHTML="<b>No. of possible outcomes after your last move:</b> "+x;
}