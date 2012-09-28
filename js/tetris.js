// Barebone DOM tetris. Speed may be a little too much for beginners, feel free to adjust the code !
// Code is not optimized (just look at all these non localized global variables ...), not beautiful.

var containerId = '#gameContainer', scoreContainerId = '#scoreContainer', lineCountContainerId = '#lineCountContainer', levelContainerId = '#levelContainer', piecePreviewId = '#piecePreviewContainer'
  , matrixWidth = 10, matrixHeight = 20     // Measured in number of minos
  , minoWidth = 8, minoHeight = 8           // Measured in pixels
  , leftZero = 120, topZero = 20
  , HUDLeftOffset = 20, HUDTopOffset = 32, HUDLineOffset = 20
  , initialSpeed = 200;

var displayBox = $(containerId), scoreBox = $(scoreContainerId), lineCountBox = $(lineCountContainerId), levelBox = $(levelContainerId), piecePreviewBox = $(piecePreviewContainer)
  , matrixState = [], score = 0, lineCount = 0, currentLevel = 1, intervalId, gamePaused = false, gameFinished = false, inBlockZone = false, currentSpeed = initialSpeed, i, j;

var pieces = [ [{x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}]        // T
             , [{x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: 1, y: 0}]        // Bar
             , [{x: -1, y: 0}, {x: 0, y: 0}, {x: -1, y: 1}, {x: 1, y: 0}]       // L
             , [{x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}]        // Inverted L
             , [{x: -1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}]        // N
             , [{x: 1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1}, {x: -1, y: 1}]       // Inverted N
             , [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}] ]      // Square

  , squareType = 6    // Used to prevent the square from rotating
  , currentPiece = {type: 0, centerX: 0, centerY: 0, rotation: [], minos: []}
  , nextPiece = {type: 0, centerX: 0, centerY: 0, rotation: [], minos: []}
  , scorePerNumberOfLines = [0, 80, 200, 400, 1000];


// Initialize matrix status to only nulls (empty start state) and place HUD items
var initializeGame = function() {
  var temp;

  for (i = 0; i < matrixWidth; i += 1) {
    temp = [];
    for (j = 0; j < matrixHeight; j += 1) { temp.push(null); }
    matrixState.push(temp);
  }

  displayBox.css('width', matrixWidth * minoWidth);
  displayBox.css('height', matrixHeight * minoHeight);
  displayBox.css('left', leftZero);
  displayBox.css('top', topZero);

  scoreBox.css('left', leftZero + matrixWidth * minoWidth + HUDLeftOffset);
  lineCountBox.css('left', leftZero + matrixWidth * minoWidth + HUDLeftOffset);
  levelBox.css('left', leftZero + matrixWidth * minoWidth + HUDLeftOffset);
  piecePreviewBox.css('left', leftZero + matrixWidth * minoWidth + HUDLeftOffset);

  piecePreviewBox.css('top', topZero + HUDTopOffset);
  scoreBox.css('top', topZero + HUDTopOffset + 2 * HUDLineOffset);
  lineCountBox.css('top', topZero + HUDTopOffset + 3 * HUDLineOffset);
  levelBox.css('top', topZero + HUDTopOffset + 4 * HUDLineOffset);

  createNextPiece();
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

var placeNextMino = function(mino, place) {
  mino.css('left', getLeft( nextPiece.centerX + place.x ));
  mino.css('top', getTop( nextPiece.centerY + place.y ));
}

var createNextPiece = function() {
  var temp;

  // Re-initialize nextPiece
  nextPiece.type = Math.floor(Math.random() * pieces.length);
  nextPiece.centerX = matrixWidth + 5;
  nextPiece.centerY = 1;
  nextPiece.minos = [];
  nextPiece.rotation = [];

  for (i = 0; i < pieces[nextPiece.type].length; i += 1) {
    temp = $(document.createElement('div'));
    temp.attr('class', 'piece' + nextPiece.type);
    temp.css('width', minoWidth);
    temp.css('height', minoHeight);

    placeNextMino(temp, pieces[nextPiece.type][i]);
    displayBox.append(temp);
    nextPiece.minos.push(temp);    // The minos array is in the same order as nextPiece.rotation
    nextPiece.rotation.push( {x: pieces[nextPiece.type][i].x, y: pieces[nextPiece.type][i].y} );
  }
}

// After last piece was placed, create a new one on top of the matrix
var createNewPiece = function() {
  currentPiece.type = nextPiece.type;
  currentPiece.centerX = Math.floor(matrixWidth / 2);
  currentPiece.centerY = nextPiece.centerY;
  currentPiece.rotation = nextPiece.rotation;
  currentPiece.minos = nextPiece.minos;
  refreshCurrentPieceDisplay();

  if (currentPieceCantMoveAnymore()) {
    clearInterval(intervalId);
    gameFinished = true;
    alert('Game finished');
  }

  createNextPiece();
}


// Returns true if the piece hits another piece or the bottom
var currentPieceCantMoveAnymore = function() {
  var result = false, theX, theY;

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
  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    // The minos array is in the same order as currentPiece.rotation
    placeMino(currentPiece.minos[i], currentPiece.rotation[i]);
  }
}


// Make piece move one step towards the bottom, if it's not blocked by another piece or the floor
var moveCurrentPieceDown = function() {
  var canMove = true, theX, theY;

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

// Same than before but we go all the way down 
var moveCurrentPieceAllTheWayDown = function() {
  var theX, theY, tentativeCenterY, found, newCenterY = -1;     // Initialize newCenterY at an impossible value for first check

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    theX = getActualXCoord( currentPiece.rotation[i] );
    theY = getActualYCoord( currentPiece.rotation[i] );

    found = false;
    tentativeCenterY = matrixHeight - 1 - currentPiece.rotation[i].y;   // Value if only null values are encoutered in the column
    for (j = theY + 1; j <= matrixHeight - 1; j += 1 ) {
      if (! found) {
        if (matrixState[theX][j] !== null) {
          found = true;
          tentativeCenterY = j - currentPiece.rotation[i].y - 1;
        }
      }
    }

    if (newCenterY === -1) {
      newCenterY = tentativeCenterY
    } else {
      newCenterY = Math.min(newCenterY, tentativeCenterY);
    }
  }

  currentPiece.centerY = newCenterY;
}


var moveCurrentPieceLeft = function() {
  var canMove = true, theX, theY;

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
  var canMove = true, theX, theY;

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
  var temp, theX, theY, canMove = true;

  if (currentPiece.type === squareType) { return; }   // Don't rotate square

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


var blockCurrentPiece = function() {
  var theX, theY;

  for (i = 0; i < currentPiece.rotation.length; i += 1) {
    theX = getActualXCoord( currentPiece.rotation[i] );
    theY = getActualYCoord( currentPiece.rotation[i] );

    matrixState[theX][theY] = currentPiece.minos[i];
  }
}


var checkAndRemoveLines = function() {
  var numberLines = 0, linesChecked = {}, linesToRemove = [], k, temp;

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

  updateHUD(numberLines);
}


var changeSpeed = function(newSpeed) {
  clearInterval(intervalId);
  intervalId = setInterval(moveCurrentPieceDownAndRefresh, newSpeed);
}

var updateHUD = function(linesMade) {
  var formerLevel = currentLevel;

  lineCount += linesMade;
  lineCountBox.html('Lines: ' + lineCount);

  currentLevel = Math.floor(lineCount / 10) + 1;
  levelBox.html('Level: ' + currentLevel);

  score += currentLevel * scorePerNumberOfLines[linesMade];
  scoreBox.html('Score: ' + score);

  currentSpeed = (4 * initialSpeed) / (4 + currentLevel);
  changeSpeed(currentSpeed);
}


// Block zone: when you can still move the piece although its next to the one beneath
var moveCurrentPieceDownAndRefresh = function() {
  if (currentPieceCantMoveAnymore()) {
    if (inBlockZone) {
      blockCurrentPiece();
      checkAndRemoveLines();
      createNewPiece();
      inBlockZone = false;
    } else {
      inBlockZone = true;
      changeSpeed(currentSpeed * 2);
    }
  } else {
    if (inBlockZone) {
      inBlockZone = false;
      changeSpeed(currentSpeed);
    }
    moveCurrentPieceDown();
    refreshCurrentPieceDisplay();
  }
}


$(document).bind('keydown', function(e) {
  if (gameFinished) { return; }   // No action possible after game finishes

  if (e.keyCode === 27) {
    if (! gamePaused) {
      clearInterval(intervalId);
      gamePaused = true;
    } else {
      intervalId = setInterval(moveCurrentPieceDownAndRefresh, currentSpeed);
      gamePaused = false;
    }
  }

  if (! gamePaused) {
    if (e.keyCode === 32) {
      moveCurrentPieceAllTheWayDown();
      refreshCurrentPieceDisplay();
      blockCurrentPiece();
      checkAndRemoveLines();
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
  }
});


initializeGame();
createNewPiece();
intervalId = setInterval(moveCurrentPieceDownAndRefresh, currentSpeed);

