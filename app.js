const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let tilesOnGameBoard = [];
let playerNames = [];
let tiles = [
  [0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [0,6],
  [1,1], [1,2], [1,3], [1,4], [1,5], [1,6],
  [2,1], [2,2], [2,3], [2,4], [2,5], [2,6],
  [3,1], [3,2], [3,3], [3,4], [3,5], [3,6],
  [4,1], [4,2], [4,3], [4,4], [4,5], [4,6],
  [5,1], [5,2], [5,3], [5,4], [5,5], [5,6],
  [6,1], [6,2], [6,3], [6,4], [6,5], [6,6],
];

const boardPlayPosition = {
  head: 'HEAD',
  tail: 'TAIL'
}

const captureUserInput = data => new Promise(resolve => rl.question(data, resolve));

const domino = {
  init: async () => {
    domino.shuffleTiles();
    domino.getPlayerNames();
  },
  getPlayerNames: async () => {
    const playerOneName = await captureUserInput("Player 1, what's your name? ");
    playerNames.push(playerOneName);

    const playerTwoName = await captureUserInput("Player 2, what's your name? ");
    playerNames.push(playerTwoName);

    domino.startGameLoop();
  },
  drawRandomTile: () => {
    const random = Math.floor(Math.random() * (tiles.length - 1));
    return tiles.splice(random, 1)[0];
  },
  placeTileOnBoard: (tile, position) => {
    switch (position) {
      case 'HEAD':
        tilesOnGameBoard.unshift(tile);
        break;
      case 'TAIL':
        tilesOnGameBoard.push(tile);
        break;
      default:
        console.error(`${position} is invalid.`);
        break;
    }
  },
  addTileToPlayerHand: (tile, player) => {
    player.tilesOnHand.push(tile);
  },
  removeTileFromPlayerHand: (player, tileIndex) => player.tilesOnHand.splice(tileIndex, 1)[0],
  getBoardState: () => {
    let result = '';
    
    tilesOnGameBoard.forEach((tile) => {
      result += `<${tile[0]}:${tile[1]}> `;
    });

    return result;
  },
  getPlayerSuccessMoveMessage: (playerName, playerTile, tileOnBoard) => {
    console.log(`\n${playerName} plays <${playerTile[0]}:${playerTile[1]}> to connect to tile <${tileOnBoard[0]}:${tileOnBoard[1]}>\n`);
  },
  shuffleTiles: () => {
    for (let index = tiles.length - 1; index > 0; index--) {
      const random = Math.floor(Math.random() * index);
      const temp = tiles[index];
      tiles[index] = tiles[random];
      tiles[random] = temp;
    }
  },
  moveIsValid: (firstTile, secondTile, playerTile) => {
    if (firstTile[0] === playerTile[1]) {
      return {
        position: boardPlayPosition.head,
        inverted: false
      };
    } else if (firstTile[0] === playerTile[0]) {
      return {
        position: boardPlayPosition.head,
        inverted: true
      };
    } else if (secondTile[1] === playerTile[0]) {
      return {
        position: boardPlayPosition.head,
        inverted: false
      };
    } else if (secondTile[1] === playerTile[1]) {
      return {
        position: boardPlayPosition.head,
        inverted: true
      };
    }

    return null;
  },
  invertTile: (tile) => tile.reverse(),
  startGameLoop: async () => {
    let winner = null;
    let playerOne = {
      name: playerNames[0],
      tilesOnHand: []
    };

    let playerTwo = {
      name: playerNames[1],
      tilesOnHand: [] 
    };

    let currentPlayer = playerOne;

    // Each player draws seven tiles.
    for (let index = 0; index < 7; index++) {
      const playerOneTile = domino.drawRandomTile();
      domino.addTileToPlayerHand(playerOneTile, playerOne);

      const playerTwoTile = domino.drawRandomTile();
      domino.addTileToPlayerHand(playerTwoTile, playerTwo);
    }

    // Pick a random tile to start the line of play.
    const firstTile = domino.drawRandomTile();
    domino.placeTileOnBoard(firstTile, boardPlayPosition.tail);

    console.log(`\nGame starting with first tile: <${firstTile[0]}:${firstTile[1]}>\n`);
    
    while (!winner) {
      let gameInProgress = true;

      gameInputLoop:
      while (gameInProgress) {
        console.log(`${currentPlayer.name}, it's your turn to play!\nYou have the following tiles on hand:`);
        currentPlayer.tilesOnHand.forEach((tile, index) => {
          console.log(`${index + 1}. <${tile[0]}:${tile[1]}>`);
        });

        console.log(`\nBoard is now: ${domino.getBoardState()}\n`);

        let tileOption = await captureUserInput(`Which tile would you like to play, select a tile from (1 - ${currentPlayer.tilesOnHand.length}) or 0 to draw another tile: `);

        if (isNaN(tileOption) || parseInt(tileOption) > currentPlayer.tilesOnHand.length) {
          console.error(`ERROR: ${tileOption} is not a valid option!`);
          
          continue gameInputLoop;
        }

        tileOption = parseInt(tileOption);

        const firstTileOnBoard = tilesOnGameBoard[0];
        const lastTileOnBoard = tilesOnGameBoard[tilesOnGameBoard.length - 1];

        if (tileOption === 0) {
          if (tiles.length !== 0) {
            let tileFromBoneyard = domino.drawRandomTile();

            console.log(`\n${currentPlayer.name} draws tile <${tileFromBoneyard[0]}:${tileFromBoneyard[1]}>\n`);

            const positionToMovePlayerTile = domino.moveIsValid(firstTileOnBoard, lastTileOnBoard, tileFromBoneyard);

            if (positionToMovePlayerTile) {

              tileFromBoneyard = positionToMovePlayerTile.inverted ? domino.invertTile(tileFromBoneyard) : tileFromBoneyard;

              domino.placeTileOnBoard(tileFromBoneyard, positionToMovePlayerTile.position);

              if (positionToMovePlayerTile.position === boardPlayPosition.head) {
                domino.getPlayerSuccessMoveMessage(currentPlayer.name, tileFromBoneyard, firstTileOnBoard);
              } else {
                domino.getPlayerSuccessMoveMessage(currentPlayer.name, tileFromBoneyard, lastTileOnBoard);
              }
            } else {
              console.log(`${currentPlayer.name} can't play <${tileFromBoneyard[0]}:${tileFromBoneyard[1]}>, adding the tile to ${currentPlayer.name}'s tiles on hand and ending turn.\n`);
              domino.addTileToPlayerHand(tileFromBoneyard, currentPlayer);
            }
          } else {
            console.error(`There are no longer any tiles available in the boneyard...${currentPlayer.name} can't play...ending turn.`)
          }
          
          currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
          continue gameInputLoop;
        } else {
          const playerTileIndex = tileOption - 1;
          const playerTile = currentPlayer.tilesOnHand[playerTileIndex];
          const positionToMovePlayerTile = domino.moveIsValid(firstTileOnBoard, lastTileOnBoard, playerTile);

          if (positionToMovePlayerTile) {
            let tileToMove = domino.removeTileFromPlayerHand(currentPlayer, playerTileIndex);
            tileToMove = positionToMovePlayerTile.inverted ? domino.invertTile(tileToMove) : tileToMove;

            domino.placeTileOnBoard(tileToMove, positionToMovePlayerTile.position)

            if (positionToMovePlayerTile.position === boardPlayPosition.head) {
              domino.getPlayerSuccessMoveMessage(currentPlayer.name, playerTile, firstTileOnBoard);
            } else {
              domino.getPlayerSuccessMoveMessage(currentPlayer.name, playerTile, lastTileOnBoard);
            }
          } else {
            let errorMessage = tilesOnGameBoard.length > 1 
              ? `Can't connect <${playerTile[0]}:${playerTile[1]}> to <${firstTileOnBoard[0]}:${firstTileOnBoard[1]}>`
              : `Can't connect <${playerTile[0]}:${playerTile[1]}> to <${firstTileOnBoard[0]}:${firstTileOnBoard[1]}> or <${lastTileOnBoard[0]}:${lastTileOnBoard[1]}>`;
            
            console.error(`\n${errorMessage}\n`);
            
            continue gameInputLoop;
          }

          if (currentPlayer.tilesOnHand.length === 0) {
            gameInProgress = false;
            winner = currentPlayer;
          }

          currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
          continue gameInputLoop;
        }
      }

      domino.end();
    }
  },
  end: () => {
    rl.close()
  }
};

domino.init();