var containerId = '#gameContainer'
  , displayBox = $(containerId)
  , matrixWidth = 10, matrixHeight = 10     // Measured in number of minos
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
}


// Calculate and set a mino's coordinates
var getLeft = function(x) { return minoWidth * x; }
var getTop = function(y) { return minoHeight * y; }
var placeMino = function(mino, place) {
  mino.css('left', getLeft( currentPiece.centerX + place.x ));
  mino.css('top', getTop( currentPiece.centerY + place.y ));
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

  for (i = 0; i < pieces[currentPiece.type].length; i += 1) {
    temp = $(document.createElement('div'));
    temp.attr('class', 'piece' + currentPiece.type);
    temp.css('width', minoWidth);
    temp.css('height', minoHeight);
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
    theX = currentPiece.centerX + currentPiece.rotation[i].x;
    theY = currentPiece.centerY + currentPiece.rotation[i].y;
    if ( (matrixState[theX][theY + 1] !== null) || theY >= matrixHeight - 1 ) { result = true; }
  }

  console.log("CANT : " + currentPiece.centerY + " - " + result);

  return result;
}


var refreshCurrentPieceDisplay = function() {
  var i;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    // The minos array is in the same order as currentPiece.rotation
    placeMino(currentPiece.minos[i], currentPiece.rotation[i]);
  }
}


// Make piece move one step towards the bottom
var makeCurrentPieceMoveOneStep = function() {
  currentPiece.centerY += 1;

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

var bloup = function() {
  var theX, theY
    , i;

  makeCurrentPieceMoveOneStep();
  refreshCurrentPieceDisplay();

  if (currentPieceCantMoveAnymore()) {
    for (i = 0; i < currentPiece.rotation.length; i += 1) {
      theX = currentPiece.centerX + currentPiece.rotation[i].x;
      theY = currentPiece.centerY + currentPiece.rotation[i].y;

      matrixState[theX][theY] = currentPiece.minos[i];
    }

    createNewPiece();
  }


}



initializeMatrix();
createNewPiece();

$('#theButton').on('click', bloup);





