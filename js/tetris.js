var containerId = '#gameContainer'
  , displayBox = $(containerId)
  , matrixWidth = 10, matrixHeight = 20     // Measured in number of minos
  , minoWidth = 8, minoHeight = 8         // Measured in pixels
  , matrixState = []
  , score, lineCount, currentLevel
  , i, j;

var pieces = [ [{x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}]        // T
             , [{x: 0, y: 0}, {x: -1, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}] ]     // Bar
  , currentPiece = {type: 0, centerX: 0, centerY: 0, rotation: [], minos: []};


// Initialize matrix status to only nulls (empty start state)
var initializeMatrix = function() {
  var temp;
  for (i = 0; i < matrixWidth; i += 1) {
    temp = [];
    for (j = 0; j < matrixHeight; j += 1) { temp.push(null); }
    matrixState.push(temp);
  }

  displayBox.css('width', matrixWidth * minoWidth);
  displayBox.css('height', matrixHeight * minoHeight);
}


// Calculate and set a mino's coordinates
var getLeft = function(x) { return minoWidth * x; }
var getTop = function(y) { return minoHeight * y; }

var getActualXCoord = function(place) { return currentPiece.centerX + place.x; }
var getActualYCoord = function(place) { return currentPiece.centerY + place.y; }

var placeMino = function(mino, place) {
  mino.css('left', getLeft( getActualXCoord(place) ));
  mino.css('top', getTop( getActualYCoord(place) ));
}


// After last piece was placed, create a new one on top of the matrix
var createNewPiece = function() {
  var temp, i;

  // Re-initialize currentPiece
  currentPiece.type = 0;     // TODO randomize piece choice
  currentPiece.centerX = Math.floor(matrixWidth / 2);
  currentPiece.centerY = 1;
  currentPiece.minos = [];
  currentPiece.rotation = [];

  // Just for fun, TODO remove
  var color = 'rgb(' + Math.floor(Math.random() * 255) + ', ' + Math.floor(Math.random() * 99) + ', ' + Math.floor(Math.random() * 99) +')';

  for (i = 0; i < pieces[currentPiece.type].length; i += 1) {
    temp = $(document.createElement('div'));
    temp.attr('class', 'piece' + currentPiece.type);
    temp.css('width', minoWidth);
    temp.css('height', minoHeight);
    temp.css('background-color', color);
    placeMino(temp, pieces[currentPiece.type][i]);
    displayBox.append(temp);
    currentPiece.minos.push(temp);    // The minos array is in the same order as currentPiece.rotation
    currentPiece.rotation.push( {x: pieces[currentPiece.type][i].x, y: pieces[currentPiece.type][i].y} );
  }
}


// Returns true if the piece hits another piece or the bottom
var currentPieceCantMoveAnymore = function() {
  var result = false
    , theX, theY
    , i;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    theX = getActualXCoord( currentPiece.rotation[i] );
    theY = getActualYCoord( currentPiece.rotation[i] );
    if ( (matrixState[theX][theY + 1] !== null) || theY >= matrixHeight - 1 ) { result = true; }
  }

  return result;
}


var refreshCurrentPieceDisplay = function() {
  var i;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    // The minos array is in the same order as currentPiece.rotation
    placeMino(currentPiece.minos[i], currentPiece.rotation[i]);
  }
}


// Make piece move one step towards the bottom, if it's not blocked by another piece or the floor
var moveCurrentPieceDown = function() {
  var canMove = true
    , theX, theY
    , i;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    theX = getActualXCoord( currentPiece.rotation[i] );
    theY = getActualYCoord( currentPiece.rotation[i] );

    if (theY >= matrixHeight - 1) {
      canMove = false;
    } else if (matrixState[theX][theY + 1] !== null) {
      canMove = false;
    }
  }

  if (canMove) { currentPiece.centerY += 1; }
}

var moveCurrentPieceLeft = function() {
  var i, canMove = true
    , theX, theY;


  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    theX = getActualXCoord( currentPiece.rotation[i] );
    theY = getActualYCoord( currentPiece.rotation[i] );

    if (theX === 0) {
      canMove = false;
    } else if (matrixState[theX - 1][theY] !== null) {
      canMove = false;
    }
  }

  if (canMove) {
    currentPiece.centerX -= 1;
  }
}

var moveCurrentPieceRight = function() {
  var i, canMove = true
    , theX, theY;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    theX = getActualXCoord( currentPiece.rotation[i] );
    theY = getActualYCoord( currentPiece.rotation[i] );

    if (theX === matrixWidth - 1) {
      canMove = false;
    } else if (matrixState[theX + 1][theY] !== null) {
      canMove = false;
    }
  }

  if (canMove) {
    currentPiece.centerX += 1;
  }
}



var rotateCurrentPieceLeft = function() {
  var i, temp;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    temp = currentPiece.rotation[i].y;
    currentPiece.rotation[i].y = - currentPiece.rotation[i].x;
    currentPiece.rotation[i].x = temp;
  }

  refreshCurrentPieceDisplay();
}


var rotateCurrentPieceRight = function() {
  var i, temp;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    temp = currentPiece.rotation[i].y;
    currentPiece.rotation[i].y = currentPiece.rotation[i].x;
    currentPiece.rotation[i].x = - temp;
  }

  refreshCurrentPieceDisplay();
}

var blockCurrentPiece = function() {
  var theX, theY
    , i;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    theX = getActualXCoord( currentPiece.rotation[i] );
    theY = getActualYCoord( currentPiece.rotation[i] );

    matrixState[theX][theY] = currentPiece.minos[i];
  }
}



initializeMatrix();
createNewPiece();

$('#theButton').on('click', moveCurrentPieceRight);


$(document).bind('keydown', function(e) {
  if (e.keyCode ===32) {
    blockCurrentPiece();
    createNewPiece();
  }

  if (e.keyCode === 39) {
    moveCurrentPieceRight();
    refreshCurrentPieceDisplay();
  }

  if (e.keyCode === 37) {
    moveCurrentPieceLeft();
    refreshCurrentPieceDisplay();
  }

  if (e.keyCode === 38) {
    rotateCurrentPieceLeft();
    refreshCurrentPieceDisplay();
  }

  if (e.keyCode === 40) {
    moveCurrentPieceDown();
    refreshCurrentPieceDisplay();
  }
});




