export const createInitialState = () => [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

export const checkWinner = (gameState) => {
  // Check rows
  for (let row = 0; row < gameState.length; row++) {
    if (
      gameState[row][0] &&
      gameState[row][0] === gameState[row][1] &&
      gameState[row][1] === gameState[row][2]
    ) {
      return {
        winner: gameState[row][0],
        winningArray: [row * 3 + 0, row * 3 + 1, row * 3 + 2],
      };
    }
  }

  // Check columns
  for (let col = 0; col < gameState.length; col++) {
    if (
      gameState[0][col] &&
      gameState[0][col] === gameState[1][col] &&
      gameState[1][col] === gameState[2][col]
    ) {
      return {
        winner: gameState[0][col],
        winningArray: [0 * 3 + col, 1 * 3 + col, 2 * 3 + col],
      };
    }
  }

  // Check diagonals
  if (
    gameState[0][0] &&
    gameState[0][0] === gameState[1][1] &&
    gameState[1][1] === gameState[2][2]
  ) {
    return {
      winner: gameState[0][0],
      winningArray: [0, 4, 8],
    };
  }

  if (
    gameState[0][2] &&
    gameState[0][2] === gameState[1][1] &&
    gameState[1][1] === gameState[2][0]
  ) {
    return {
      winner: gameState[0][2],
      winningArray: [2, 4, 6],
    };
  }

  // Check for draw
  const isDrawMatch = gameState.flat().every((e) => {
    return e === "circle" || e === "cross";
  });

  if (isDrawMatch) {
    return { winner: "draw", winningArray: [] };
  }

  return { winner: null, winningArray: [] };
};
