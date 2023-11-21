// tictactoe.js

class TicTacToe {
    constructor() {
      this.board = Array(9).fill(null);
      this.currentPlayer = 'X';
    }
  
    makeMove(index) {
      if (this.board[index] === null) {
        this.board[index] = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  
    getState() {
      return this.board;
    }
  
    restart() {
      this.board = Array(9).fill(null);
      this.currentPlayer = 'X';
    }
  
    isValidMove(index) {
      return this.board[index] === null;
    }
  }
  
  module.exports = TicTacToe;
      