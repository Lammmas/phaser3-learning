import { Cell } from './types';

export interface AvailablePosition {
  row: number;
  col: number;
}

export default class State {
  turn: 'X' | 'O';
  aiMovesCount: number;
  result: string;
  scoreBase: number;
  _board: Cell[][];

  constructor(old?: State) {
    this.turn = 'O';
    this.aiMovesCount = 0;
    this.result = '';
    this.board = [];

    if (old){
      this.aiMovesCount = old.aiMovesCount;
      this.result = old.result;
      this.turn = old.turn;
      // Because this lil b kept being referenced, not copied... JSON to the rescue!
      this.board = JSON.parse(JSON.stringify(old.board));
    }
  }

  get isAITurn(): boolean {
    return this.turn === 'X';
  }

  get board(): Cell[][] {
    return this._board;
  }

  set board(board: Cell[][]) {
    this._board = board;
    this.scoreBase = board.length > 0 ? board.length * board[0].length : 0;
  }

  get score(): number {
    if (this.result) {
      if (this.result === 'X-won') return this.scoreBase - this.aiMovesCount;
      else if (this.result === 'O-won') return (-1 * this.scoreBase) + this.aiMovesCount;
    }

    return 0;
  };

  takeTurn = (row: number, col: number): State => {
    this._board[row][col].value = this.turn;

    // TODO: Support switching AI between X and O
    // Only advance aiMovesCount if AI (O) has FINISHED their move
    if (this.isAITurn) this.turn = 'O';
    else {
      this.aiMovesCount++;
      this.turn = 'X';
    }

    return this;
  }

  terminal = (): boolean => {
    // TODO: support non-equal sides
    // TODO: support non-equal rows/cols VS no. needed to win
    let filled = '';
    //check cols
    for (let col = 0; col < this._board[0].length; col++) {
      filled = '';

      for (let row = 0; row < this._board.length; row++) {
        if (this._board[row][col].value === '') {
          filled = '';
          break;
        }

        if (filled !== '' && this._board[row][col].value !== filled) {
          filled = '';
          break;
        }

        filled = this._board[row][col].value;
      }

      if (filled) {
        this.result = `${filled}-won`;
        return true;
      }
    }

    //check rowumns
    for (let row = 0; row < this._board.length; row++) {
      filled = '';

      for (let col = 0; col < this._board[row].length; col++) {
        if (this._board[row][col].value === '') {
          filled = '';
          break;
        }

        if (filled !== '' && this._board[row][col].value !== filled) {
          filled = '';
          break;
        }

        filled = this._board[row][col].value;
      }
      if (filled) {
        this.result = `${filled}-won`;
        return true;
      }
    }

    //check right diagonals
    filled = '';
    for (let i = 0; i < this._board.length; i++) {
      if (this._board[i][i].value === '') {
        filled = '';
        break;
      }

      if (filled !== '' && this._board[i][i].value !== filled) {
        filled = '';
        break;
      }

      filled = this._board[i][i].value;
    }

    if (filled) {
      this.result = `${filled}-won`;
      return true;
    }

    //check left diagonals
    filled = '';
    for (let row = this._board.length - 1, col = 0; (row >= 0 && col < this._board.length); row--, col++) {
      if (this._board[row][col].value === '') {
        filled = '';
        break;
      }

      if (filled !== '' && this._board[row][col].value !== filled) {
        filled = '';
        break;
      }

      filled = this._board[row][col].value;
    }

    if (filled) {
      this.result = `${filled}-won`;
      return true;
    }

    if (this._emptyCellsCount() === 0) {
      this.result = 'draw';
      return true;
    }

    return false;
  };

  getAvailablePositions = (): AvailablePosition[] => {
    const positions = [];

    for (let i = 0; i < this._board.length; i++) {
      for (let j = 0; j < this._board[i].length; j++) {
        if (this._board[i][j].value === '') positions.push({ row: i, col: j });
      }
    }

    return positions;
  };

  _emptyCellsCount = (): number => this.getAvailablePositions().length;
}
