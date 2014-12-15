var canvas;
var context;
var width, height;
var cell = new Array();
var status_text;

var leaf_count=0;

var playing=true;

var s_size = 50; //Symbol Size

var INFTY = 100000;

//NOTE: Player 2 is the computer, while Player 1 is the human player.

//===============================BEGIN NEGAMAX ALGORITHM================================

function nextMove() {
	//Set best as lowest possible
	var best = {score:-INFTY, move:-1}
	
	//Temporary variable for score
	var temp_score = 0;

	//Counter for the label
	leaf_count=0;
	
	for(var i=0; i<9; i++) {
		if(isEmpty(i)) {
			//Make possible move
			cell[i]=2;

			//Compute best move score for human player
			temp_score = -negaMax(1);
			
			//Undo previous move
			cell[i]=0;

			//Take greatest score and move
			if(temp_score > best.score) {
				best.move = i;
				best.score = temp_score;
				//loginfo("Better Move found: "+i+" With Score "+best.score);
			}
		}
	}
	
	//Set label values
	setScore(best.score);
	setCount(leaf_count);

	//Perform best computed move
	cell[best.move] = 2;

	//Draw move performed
	var a = getCellXY(best.move);
	drawO(a.x, a.y);

	//Check for win
	if(checkWinner()==2) {
		playing = false;
		setStatus("Sorry, you lost... try again?");
	}
}


function negaMax(player) {
	//Check and add accordingly for possible win
	var a = checkWinner();
	if(a>0) {
		leaf_count++;
		if(a==player) return 100;
		else return -100;
	}

	//Check and add accordingly for possible tie
	if(checkTie()) {
		leaf_count++;
		return 0;
	} 

	//Initiate temporary variables
	var max = -INFTY;
	var temp = 0;

	//Perform and compute all further possible moves
	for(var i=0; i<9; i++) {
		if(isEmpty(i)){
			//Do possible move
			cell[i]=player;

			//Compute best score
			temp = -negaMax(player==1 ? 2:1)*.5;
			
			//Undo previous move
			cell[i]=0;

			//Swap max if necessary
			if(temp > max) {
				max = temp;
			}
		}
	}
	return max;
}

//===============================END NEGAMAX ALGORITHM================================

//Declared for loading the document, canvas, et al, and initiating drawing
function onLoad() {
	canvas = document.getElementById("cnv");

	if(canvas.getContext) {
		loginfo("Canvas loaded correctly");
		context = canvas.getContext('2d');
	}
	else {
		logerr("Canvas could not load correctly");
		return;
	}

	status_text = document.getElementById('status');
	score_text = document.getElementById('score');
	count_text = document.getElementById('count');

	init();
}

//Initialize all of the labels and the board
function init() {
	playing = true;

	width = 300;
	height = 300;
	leaf_count = 0;

	setCount(leaf_count);
	setScore("-INFTY");
	setStatus("Ready to begin (player turn).")

	for(var i=0; i<9; i++)
		cell[i]=0;

	drawCanvas();
}

//Clear the board
function clearBoard() {
	context.clearRect(0, 0, width, height);
	init();
}

//Function to draw the "X" (pass in the center point)
function drawX(x, y) {
	context.beginPath();
	context.strokeStyle="#0099FF";
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

	context.strokeStyle="#FF9900";
	context.lineWidth=3.;

	context.arc(x, y, s_size/2,
		0, 2*Math.PI, false);

	context.stroke();

	context.closePath();
}

//Draw the canvas
function drawCanvas() {
	context.beginPath();

	context.strokeStyle="#000000"
	context.lineWidth = 1.;

	context.moveTo(width/3, 0);
	context.lineTo(width/3, height);

	context.moveTo(width*2/3, 0);
	context.lineTo(width*2/3, height);

	context.moveTo(0, height/3);
	context.lineTo(width, height/3);

	context.moveTo(0, height*2/3);
	context.lineTo(width, height*2/3);

	context.stroke();

	context.closePath();
}

//Get the location of the center of the cell
function getCellXY(cell_clicked) {
	return {
		x:(cell_clicked%3)*100+50,
		y:(Math.floor(cell_clicked/3))*100+50
	};
}

//Click handler
function onClick(e) {
	if(!playing) return;
	setStatus("Playing; player turn.")

	var pos = getRelPos(e);

	var cell_clicked = Math.floor(3*pos.x/width) + 3*Math.floor(3*pos.y/height);

	if(isEmpty(cell_clicked)) {
		cell[cell_clicked] = 1;
		var a = getCellXY(cell_clicked);
		drawX(a.x, a.y);
	}
	if(checkWinner()==1) {
		playing = false;
		setStatus("Nice job, mate, you won.");
	}
	else if(checkTie()) {
		playing = false;
		setStatus("It's a tie.");
	}
	else
		nextMove();
}

//Get the relative position of the board
function getRelPos(e) {
	var boundRect = canvas.getBoundingClientRect();
	return {
		x: Math.floor(e.clientX - boundRect.left),
		y: Math.floor(e.clientY - boundRect.top)
	};
}

//Just a crapload of cases
function checkWinner() {
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
	if(cell[0]!=0) {
		if(cell[1]==cell[0] && cell[0]==cell[2])
			return cell[0];
		if(cell[0]==cell[3] && cell[0]==cell[6])
			return cell[0]
	}
	if(cell[2]!=0) {
		if(cell[2]==cell[5] && cell[8]==cell[5])
			return cell[2];
	}
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

//Get the cell's value from (x, y), with error checking
function getCell(cell_x, cell_y, board) {
	if(cell_x>=0 && cell_x<=2 && cell_y>=0 && cell_y<=2)
		return board[cell_x+3*cell_y];
	else {
		logerr("WTF, you just put in a cell that doesn't exist.");
		return -1;
	}
}

//Check for empty (used for abstraction and making the snippets more understandable)
function isEmpty(cellno) {
	//loginfo("Is empty on "+cellno+" result "+cell[cellno]);
	return cell[cellno]==0;
}

//Logging funtions
function loginfo(e) {
	console.log("INFO: "+e);
}
function logerr(e) {
	console.log("ERROR: "+e);
}

//Functions for statuses
function setStatus(e) {
	status_text.innerHTML="<b>Status:</b> "+e;
}
function setScore(e) {
	score_text.innerHTML="<b>Possible min score (for computer):</b> "+e;
}
function setCount(e) {
	count_text.innerHTML="<b>Total leaf count:</b> "+e;
}