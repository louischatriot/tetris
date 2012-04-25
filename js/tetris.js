var containerId = '#gameContainer'
  , displayBox = $(containerId)
  , matrixWidth = 10, matrixHeight = 20     // Measured in number of minos
  , minoWidth = 15, minoHeight = 15         // Measured in pixels
  , matrixState = []
  , score, lineCount, currentLevel
  , i, j;

var pieces = [ [{x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}]        // T
             , [{x: 0, y: 0}, {x: -1, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}] ]     // Bar
  , currentPiece = {type: 0, centerX: 0, centerY: 0, minos: []};



// Initialize matrix status to only nulls (empty start state)
var initializeMatrix = function() {
  var temp;
  for (i = 0; i < matrixWidth; i += 1) {
    temp = [];
    for (j = 0; j < matrixHeight; j += 1) { temp.push(null); }
    matrixState.push(temp);
  }
}


var getLeft = function(x) { return minoWidth * x; }
var getTop = function(y) { return minoHeight * y; }

var placeMino = function(mino, place) {
  mino.css('left', getLeft( currentPiece.centerX + place.x ));
  mino.css('top', getTop( currentPiece.centerY + place.y ));
}

var createNewPiece = function() {
  var temp, i;

  currentPiece.type = 0;     // TODO randomize piece choice
  currentPiece.centerX = Math.floor(matrixWidth / 2);
  currentPiece.centerY = 1;
  currentPiece.minos = [];

  for (i = 0; i < pieces[currentPiece.type].length; i += 1) {
    temp = $(document.createElement('div'));
    temp.attr('class', 'piece' + currentPiece.type);
    temp.css('width', minoWidth);
    temp.css('height', minoHeight);
    placeMino(temp, pieces[currentPiece.type][i]);
    displayBox.append(temp);
    currentPiece.minos.push(temp);
  }
}


var cantMoveAnymore = function() {
  var result = false
    , movingPiece = pieces[currentPiece.type]
    , theX, theY
    , i;

  for (i = 0; i < movingPiece.length; i += 1) {
    theX = currentPiece.centerX + movingPiece[i].x;
    theY = currentPiece.centerY + movingPiece[i].y;
    if ( (matrixState[theX][theY + 1] !== null) || theY >= matrixHeight ) { result = true; }   // If the piece hits another piece or the bottom
  }

  return result;
}


var makePieceMoveOneStep = function() {
  var i;

  currentPiece.centerY += 1;

  alert('ewfdwe wer w');
}



initializeMatrix();
createNewPiece();

$('#theButton').on('click', makePieceMoveOneStep);



//$('#test').css("width", 200);


