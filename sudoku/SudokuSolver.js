import { ALPHABET, SUDOKU_9X9 } from "../constants/constants";

class SudokuSolver {
  constructor () {
    this.alphabet = '';
    this.availableCol = {};
    this.availableRow = {};
    this.blockDimentions = {};
    this.colConditions = {};
    this.config = {};
    this.isSolution = {};
    this.nAvailableCol = 0;
    this.nSolutions = 0;
    this.rowConditions = {};
    this.rowDeletedBy = {};
    this.solution = [];
    this.sudoku = '';
    this.sudokuDimentions = {};
  }

  build = (
    sudoku, 
    config = SUDOKU_9X9, 
    alphabet = ALPHABET
  ) => {
    this.alphabet = alphabet;
    this.availableCol = {};
    this.availableRow = {};
    this.config = config;
    this.sudoku = sudoku;
    this.rowConditions = {};
    this.colConditions = {};
    this.rowDeletedBy = {};
    this.nAvailableCol = 0;
    this.nSolutions = 0;
    this.isSolution = {};
    this.solution = [];

    const totalCells = this.config.SIZE * this.config.SIZE;
    const sudokuSize = this.config.SIZE;

    for (let i = 0; i < totalCells; i++) {
      const [row, col] = [this.getRow(i), this.getCol(i)];
      // ROW CONDITIONS
      for (let num = 1; num <= sudokuSize; num++) {
        this.rowConditions[`${row} ${col} ${alphabet[num]}`] = [];
        this.availableRow[`${row} ${col} ${alphabet[num]}`] = true;
        this.rowDeletedBy[`${row} ${col} ${alphabet[num]}`] = '';
        this.isSolution[`${row} ${col} ${alphabet[num]}`] = false;
      }
    }
    // COL CONDITIONS
    for (let row = 0; row < sudokuSize; row++) {
      for (let num = 1; num <= sudokuSize; num++) {
        this.colConditions[`r${row} ${alphabet[num]}`] = [];
        this.availableCol[`r${row} ${alphabet[num]}`] = true;
        this.nAvailableCol++;
      }
    }
    for (let col = 0; col < sudokuSize; col++) {
      for (let num = 1; num <= sudokuSize; num++) {
        this.colConditions[`c${col} ${alphabet[num]}`] = [];
        this.availableCol[`c${col} ${alphabet[num]}`] = true;
        this.nAvailableCol++;
      }
    }
    for (let block = 0; block < sudokuSize; block++) {
      for (let num = 1; num <= sudokuSize; num++) {
        this.colConditions[`b${block} ${alphabet[num]}`] = [];
        this.availableCol[`b${block} ${alphabet[num]}`] = true;
        this.nAvailableCol++;
      }
    }
    for (let row = 0; row < sudokuSize; row++) {
      for (let col = 0; col < sudokuSize; col++) {
        this.colConditions[`p${row} ${col}`] = [];
        this.availableCol[`p${row} ${col}`] = true;
        this.nAvailableCol++;
      }
    }
    // FILL COL ROW CONDITIONS
    for (let i = 0; i < totalCells; i++) {
      const [row, col, block] = [this.getRow(i), this.getCol(i), this.getBlock(i)];
      for (let num = 1; num <= sudokuSize; num++) {
        this.colConditions[`r${row} ${alphabet[num]}`].push(`${row} ${col} ${alphabet[num]}`);
        this.colConditions[`c${col} ${alphabet[num]}`].push(`${row} ${col} ${alphabet[num]}`);
        this.colConditions[`b${block} ${alphabet[num]}`].push(`${row} ${col} ${alphabet[num]}`);
        this.colConditions[`p${row} ${col}`].push(`${row} ${col} ${alphabet[num]}`);

        this.rowConditions[`${row} ${col} ${alphabet[num]}`].push(`r${row} ${alphabet[num]}`);
        this.rowConditions[`${row} ${col} ${alphabet[num]}`].push(`c${col} ${alphabet[num]}`);
        this.rowConditions[`${row} ${col} ${alphabet[num]}`].push(`b${block} ${alphabet[num]}`);
        this.rowConditions[`${row} ${col} ${alphabet[num]}`].push(`p${row} ${col}`);
      }
    }
    // FILL DEFAULT SUDOKU
    for (let i = 0; i < totalCells; i++) {
      const [row, col] = [this.getRow(i), this.getCol(i)];
      if (sudoku[i] !== '.') {
        this.deleteRow(`${row} ${col} ${sudoku[i]}`);
      }
    }
  }

  getCoordinates = (index) => {
    const sudokuSize = this.config.SIZE;
    return [Math.floor(index / sudokuSize), index % sudokuSize];
  }

  getRow = (index) => {
    return this.getCoordinates(index)[0];
  }

  getCol = (index) => {
    return this.getCoordinates(index)[1];
  }

  getBlock = (index) => {
    const [x, y] = this.getCoordinates(index);
    const dim = this.config.DIM;
    const blockDim = this.config.BLOCK_DIM;
    return dim.width * Math.floor(x / blockDim.height) + Math.floor(y / blockDim.width);
  }

  addRow = (row) => {
    const cols = this.rowConditions[row];
    this.isSolution[row] = false;
    for (let a = 0; a < cols.length; a++) {
      const rows = this.colConditions[cols[a]];
      for (let b = 0; b < rows.length; b++) {
        if (!this.availableRow[rows[b]] && this.rowDeletedBy[rows[b]] == row) {
          this.availableRow[rows[b]] = true;
          this.rowDeletedBy[rows[b]] = '';
        }
      }
      if (!this.availableCol[cols[a]]) {
        this.availableCol[cols[a]] = true;
        this.nAvailableCol++;
      }
      
    }
  }

  deleteRow = (row) => {
    const cols = this.rowConditions[row];
    this.isSolution[row] = true;
    for (let a = 0; a < cols.length; a++) {
      const rows = this.colConditions[cols[a]];
      for (let b = 0; b < rows.length; b++) {
        if (this.availableRow[rows[b]]) {
          this.availableRow[rows[b]] = false;
          this.rowDeletedBy[rows[b]] = row;
        }
      }
      if (this.availableCol[cols[a]]) {
        this.availableCol[cols[a]] = false;
        this.nAvailableCol--;
      }
      
    }
  }

  solve = (initIndex = 0, lvl = 0) => {
    const cols = Object.keys(this.colConditions);
    if (this.nAvailableCol === 0 || lvl === 40) {
      console.log(this.nAvailableCol);
      const rows = Object.keys(this.rowConditions);
      this.solution = [];
      for (let i = 0; i < rows.length; i++) {
        if (this.isSolution[rows[i]]) {
          this.solution.push(rows[i]);
        }
      }
      this.nSolutions++;
      return;
    }
    for (let i = initIndex; i < cols.length; i++) {
      // CHOOSE A COLUMN C
      if (!this.availableCol[cols[i]]) continue;
      const rows = this.colConditions[cols[i]];
      for (let j = 0; j < rows.length; j++) {
        // CHOOSE AND INCLUDE ROW IN PARTIAL SOLUTION
        if (!this.availableRow[rows[j]]) continue;
        this.deleteRow(rows[j]);
        // RECURSIVE CALL
        this.solve(i + 1, lvl + 1);
        this.addRow(rows[j]);
      }
      break;
    }
  }

  fillSudoku = () => {
    for (let i = 0; i < this.solution.length; i++) {
      const [r, c, n] = this.solution[i].split(' ');
    }
  }

  getSolution = () => {
    return this.solution;
  }
}

export default SudokuSolver;