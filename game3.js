const gameCells = document.querySelectorAll('.gamecell');
const resetButton = document.querySelector('main button');

const namesDialog = document.querySelector('.names-dialog');
const namesDialogButton = namesDialog.querySelector('button');

const playerImages = {
    "Dev": "img/dev.png",
    "Aditi": "img/aditi.png",
    "Keera": "img/keera.jpg",
    "Nishant": "img/nishant.jpg",
    "Neelu": "img/neelu.jpg",
    "Mahi": "img/mahi.jpg",

};

const Player = (name, symbol) => {
    const formattedName = name.trim().toLowerCase(); // Ensure case-insensitive match
    const image = playerImages[Object.keys(playerImages).find(key => key.toLowerCase() === formattedName)] || null;
    const getImage = () => image;
    const getName = () => name;
    const getSymbol = () => symbol;
    return {getImage, getName, getSymbol};
};


namesDialog.showModal();
namesDialogButton.addEventListener('click', (event) => {
    const form = namesDialog.querySelector('form');
    const player1Name = form.querySelector('#name1');
    const player2Name = form.querySelector('#name2');
    if (form.checkValidity()) {
        event.preventDefault(); // Don't want to submit this form
        const player1 = Player(player1Name.value, 'X');
        const player2 = Player(player2Name.value, 'O');
        namesDialog.close();
        gameInitialization(player1, player2);
    } 
});

function gameInitialization(player1, player2) {
    const gameBoard = (() => {
        let gameBoardArray = [null, null, null, null, null, null, null, null, null];
    
        const addToArray = (symbol, position) => {
            gameBoardArray[position] = symbol;
        }
    
        const clearArray = () => {
            gameBoardArray = [null, null, null, null, null, null, null, null, null];
        }
    
        const getGameBoardRows = () => {
            const copyGameArray = [...gameBoardArray];
            const res = [];
            for (let i = 0; i < gameBoardArray.length / 3; i++) {
                res.push(copyGameArray.splice(0, 3));
            }
            return res;
        }
    
        const getGameBoardColumns = () => {
            const copyGameArray = [...gameBoardArray];
            const res = [[],[],[]];
            for (let i = 0; i < gameBoardArray.length; i++) {
                if (i % 3 === 0) {
                    res[0].push(copyGameArray[i]);
                } else if (i % 3 === 1) {
                    res[1].push(copyGameArray[i]);
                } else {
                    res[2].push(copyGameArray[i]);
                }
            }
            return res;
        }
    
        const getGameBoardDiagonals = () => {
            const copyGameArray = [...gameBoardArray];
            const diagonal1 = [copyGameArray[0], copyGameArray[4], copyGameArray[8]];
            const diagonal2 = [copyGameArray[2], copyGameArray[4], copyGameArray[6]];
            return [diagonal1, diagonal2];
        }
    
        const areItemsOfArrayEqual = (arr) => {
            const res = {
                areItemsEqual: null,
                winnerSymbol: ''
            };
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i] !== arr[i + 1] || arr[i] === null) {
                    res.areItemsEqual = false;
                    return res;
                }
            }
            res.areItemsEqual = true;
            res.winnerSymbol = arr[0];
            return res;
        } 
    
        const checkWinner = () => {
            const gameRows = getGameBoardRows();
            const gameColumns = getGameBoardColumns();
            const gameDiagonals = getGameBoardDiagonals();
            const gameCombinations = [...gameRows, ...gameColumns, ...gameDiagonals];
    
            const result = {
                hasSomeoneWon: false,
                tie: false,
                winnerSymbol: '',
            };
            
            //Checks if there is a winner
            for (let i = 0; i < gameCombinations.length; i++) {
                const localRes = areItemsOfArrayEqual(gameCombinations[i]);
                if (localRes.areItemsEqual) {
                    result.hasSomeoneWon = true;
                    result.winnerSymbol = localRes.winnerSymbol;
                    return result;
                };
            }
    
            //Checks tie
            if (!gameBoardArray.includes(null)) {
                result.tie = true;
                return result;
            }
    
            return result;
        }
    
        return {addToArray, clearArray, checkWinner};
    
    })();
    
    
    const displayController = (() => {
        const playerTurnTitle = document.querySelector('main p');
        const winnerDialog = document.querySelector('.result-dialog');
        const winnerDialogMessage = winnerDialog.querySelector('h1');
    
        // Close dialog when click outside form
        winnerDialog.addEventListener('click', (event) => {
            if (event.target === winnerDialog) {
                winnerDialog.close();
            }
        });
        
        const addPlayerSymbol = (target, symbol) => {
            target.textContent = symbol;
        }
    
        const changePlayerTurnTitle = (message) => {
            playerTurnTitle.textContent = message;
        }
    
        const showResultDialog = (message) => {
            winnerDialogMessage.textContent = message;
            winnerDialog.showModal();
        }
    
        const cleanGameboard = () => {
            gameCells.forEach(cell => {
                cell.textContent = '';
                const img = cell.querySelector('img');
                if (img) cell.removeChild(img); // Remove any image from the cell
            });
        };
        
    
        return {addPlayerSymbol, changePlayerTurnTitle, showResultDialog, cleanGameboard};
        
    })();
    
    const game = ((firstPlayer, secondPlayer) => {
        let currentPlayer = firstPlayer;
        let gameEnded = false;
    
        //Initialization of PlayerTurnTitle
        displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
    
    
        const makePlayerMove = (cell, player) => {
            if (cell.textContent !== '' || cell.querySelector('img')) return true; // Avoid overwriting
            const imagePath = player.getImage();
            if (imagePath) {
                const imgElement = document.createElement('img');
                imgElement.src = imagePath;
                imgElement.alt = player.getName();
                imgElement.style.width = "100%"; // Adjust as needed for styling
                imgElement.style.height = "100%";
                cell.appendChild(imgElement);
            } else {
                displayController.addPlayerSymbol(cell, player.getSymbol());
            }
        
            gameBoard.addToArray(player.getSymbol(), cell.dataset.position);
            return false;
        };
        
    
        const parseSymbolToPlayer = (symbol, player1, player2) => {
            switch (symbol) {
                case player1.getSymbol():
                    return player1;
        
                case player2.getSymbol():
                    return player2;
    
                default:
                    throw new Error('Invalid symbol provided');
            }
        }
    
        const processGameResult = (player1, player2) => {
            const res = {gameEnded: false};
            
            const winnerObj = gameBoard.checkWinner();
            if (winnerObj.hasSomeoneWon) {
                const winnerPlayer = parseSymbolToPlayer(winnerObj.winnerSymbol, player1, player2);
                const message = `${winnerPlayer.getName()} Wins!`;
                displayController.showResultDialog(message);
                res.gameEnded = true;
            }
            else if (winnerObj.tie) {
                const message = `It's a Tie`;
                displayController.showResultDialog(message);
                res.gameEnded = true;
            }
    
            return res;
        }
    
        const changePlayerTurn = () => {
            currentPlayer = currentPlayer === firstPlayer ? secondPlayer : firstPlayer;
            const message = gameEnded ? 'Game End' : `${currentPlayer.getName()}'s Turn`;
            displayController.changePlayerTurnTitle(message);
        }
    
        const doPlayerTurn = function(e) {
            if (gameEnded) {
                console.log('Game already ended');
                return;
            }
            console.log(`Current Player: ${currentPlayer.getName()}`);
            const isCellTaken = makePlayerMove(e.target, currentPlayer);
            if (isCellTaken) {
                console.log('Cell already taken');
                return;
            }
            const result = processGameResult(firstPlayer, secondPlayer);
            gameEnded = result.gameEnded;
            changePlayerTurn();
        }
        
    
        const cleanGame = function() {
            displayController.cleanGameboard();
            gameBoard.clearArray();
            displayController.changePlayerTurnTitle(`${currentPlayer.getName()}'s Turn`);
            gameEnded = false;
        }
    
        return {doPlayerTurn, cleanGame};
    
    })(player1, player2);
        
    resetButton.addEventListener('click', game.cleanGame);
    
    gameCells.forEach(cell => {
        cell.addEventListener('click', game.doPlayerTurn);
    });
}
