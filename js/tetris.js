var containerId = '#gameContainer'
  , displayBox = $(containerId)
  , matrixWidth = 10, matrixHeight = 20     // Measured in number of minos
  , minoWidth = 8, minoHeight = 8         // Measured in pixels
  , matrixState = []
  , score, lineCount, currentLevel
  , i, j
  , intervalId, gamePaused = false;

var pieces = [ [{x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}]        // T
             , [{x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: 1, y: 0}]        // Bar
             , [{x: -1, y: 0}, {x: 0, y: 0}, {x: -1, y: 1}, {x: 1, y: 0}]        // L
             , [{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}] ]        // Inverted L

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
  currentPiece.type = Math.floor(Math.random() * pieces.length);     // TODO randomize piece choice
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

    if ( matrixState[theX][theY] !== null) {
      result = true;
    }
    if (theY >= matrixHeight - 1) {
      result = true;
    } else if (matrixState[theX][theY + 1] !== null) {
      result = true;
    }
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
  var i, temp
    , theX, theY
    , canMove = true;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    theX = currentPiece.centerX + currentPiece.rotation[i].y;
    theY = currentPiece.centerY - currentPiece.rotation[i].x;

    if ( (theX < 0) || (theX >= matrixWidth) || (theY >= matrixHeight) || (theY < 0) ) {
      canMove = false;
    } else if (matrixState[theX][theY] !== null) {
      canMove = false;
    }
  }

  if (canMove) {
    for (i = 0; i < currentPiece.rotation.length; i += 1) {
      temp = currentPiece.rotation[i].y;
      currentPiece.rotation[i].y = - currentPiece.rotation[i].x;
      currentPiece.rotation[i].x = temp;
    }
  }
}


var rotateCurrentPieceRight = function() {
  var i, temp;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    temp = currentPiece.rotation[i].y;
    currentPiece.rotation[i].y = currentPiece.rotation[i].x;
    currentPiece.rotation[i].x = - temp;
  }
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


var checkAndRemoveLines = function() {
  var numberLines = 0
    , linesChecked = {}
    , linesToRemove = []
    , i, j, k
    , temp;

  // Calculate number of lines and Y-coord of lines to remove
  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    if (! linesChecked[ getActualYCoord(currentPiece.rotation[i]) ]) {
      linesChecked[ getActualYCoord(currentPiece.rotation[i]) ] = true;

      temp = true;
      for (j = 0; j < matrixWidth; j += 1) {
        if (matrixState[j][ getActualYCoord(currentPiece.rotation[i]) ] === null) { temp = false; }
      }

      if (temp) {
        numberLines += 1;
        linesToRemove.push(getActualYCoord(currentPiece.rotation[i]));
      }
    }
  }

  linesToRemove.sort();

  // Remove lines made
  for (k = 0; k < linesToRemove.length; k += 1) {
    for (i = 0; i < matrixWidth; i += 1) {
      matrixState[i][linesToRemove[k]].remove();
      matrixState[i][linesToRemove[k]] = null;
    }
  }

  // Collapse matrix
  for (k = 0; k < linesToRemove.length; k += 1) {
    for (j = linesToRemove[k] - 1; j >= 0; j -= 1) {
      for (i = 0; i < matrixWidth; i += 1) {
        if (matrixState[i][j] !== null) {
          matrixState[i][j].css('top', getTop(j + 1));
        }
        matrixState[i][j + 1] = matrixState[i][j];
      }
    }
  }

  return numberLines;
}



initializeMatrix();
createNewPiece();


var moveCurrentPieceDownAndRefresh = function() {
  if (currentPieceCantMoveAnymore()) {
    blockCurrentPiece();
    console.log(checkAndRemoveLines());
    createNewPiece();
  } else {
    moveCurrentPieceDown();
    refreshCurrentPieceDisplay();
  }
}


// TODO: add levels support by modifying interval time
intervalId = setInterval(moveCurrentPieceDownAndRefresh, 200);



$(document).bind('keydown', function(e) {
  if (e.keyCode === 27) {
    if (! gamePaused) {
      clearInterval(intervalId);
      gamePaused = true;
    } else {
      intervalId = setInterval(moveCurrentPieceDownAndRefresh, 200);
      gamePaused = false;
    }
  }

  if (e.keyCode === 32) {
    console.log(matrixState);
    console.log("===============");
  }


  if (! gamePaused) {
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
  }
});



console.log([18, 19, 17].sort());
