const getCoordinates = (index) => {
  return [Math.floor(index / 9), index % 9];
}

const getRow = (index) => {
  return getCoordinates(index)[0];
}

const getCol = (index) => {
  return getCoordinates(index)[1];
}

const getBlock = (index) => {
  const [x, y] = getCoordinates(index);
  return 3 * Math.floor(x / 3) + Math.floor(y / 3);
}

class SudokuSolver {
  constructor () {
    this.sudoku = '';
    this.rowConditions = {};
    this.colConditions = {};
    this.availableCol = {};
    this.availableRow = {};
    this.rowDeletedBy = {};
    this.nAvailableCol = 0;
    this.nSolutions = 0;
    this.isSolution = {};
    this.solution = [];
  }

  build = (sudoku) => {
    this.sudoku = sudoku;
    this.rowConditions = {};
    this.colConditions = {};
    this.availableCol = {};
    this.availableRow = {};
    this.rowDeletedBy = {};
    this.nAvailableCol = 0;
    this.nSolutions = 0;
    this.isSolution = {};
    this.solution = [];
    for (let i = 0; i < 81; i++) {
      const [row, col, block] = [getRow(i), getCol(i), getBlock(i)];
      // ROW CONDITIONS
      for (let num = 1; num <= 9; num++) {
        this.rowConditions[`${row} ${col} ${num}`] = [];
        this.availableRow[`${row} ${col} ${num}`] = true;
        this.rowDeletedBy[`${row} ${col} ${num}`] = '';
        this.isSolution[`${row} ${col} ${num}`] = false;
      }
    }
    // COL CONDITIONS
    for (let row = 0; row < 9; row++) {
      for (let num = 1; num <= 9; num++) {
        this.colConditions[`r${row} ${num}`] = [];
        this.availableCol[`r${row} ${num}`] = true;
        this.nAvailableCol++;
      }
    }
    for (let col = 0; col < 9; col++) {
      for (let num = 1; num <= 9; num++) {
        this.colConditions[`c${col} ${num}`] = [];
        this.availableCol[`c${col} ${num}`] = true;
        this.nAvailableCol++;
      }
    }
    for (let block = 0; block < 9; block++) {
      for (let num = 1; num <= 9; num++) {
        this.colConditions[`b${block} ${num}`] = [];
        this.availableCol[`b${block} ${num}`] = true;
        this.nAvailableCol++;
      }
    }
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        this.colConditions[`p${row} ${col}`] = [];
        this.availableCol[`p${row} ${col}`] = true;
        this.nAvailableCol++;
      }
    }
    // FILL COL ROW CONDITIONS
    for (let i = 0; i < 81; i++) {
      const [row, col, block] = [getRow(i), getCol(i), getBlock(i)];
      for (let num = 1; num <= 9; num++) {
        this.colConditions[`r${row} ${num}`].push(`${row} ${col} ${num}`);
        this.colConditions[`c${col} ${num}`].push(`${row} ${col} ${num}`);
        this.colConditions[`b${block} ${num}`].push(`${row} ${col} ${num}`);
        this.colConditions[`p${row} ${col}`].push(`${row} ${col} ${num}`);

        this.rowConditions[`${row} ${col} ${num}`].push(`r${row} ${num}`);
        this.rowConditions[`${row} ${col} ${num}`].push(`c${col} ${num}`);
        this.rowConditions[`${row} ${col} ${num}`].push(`b${block} ${num}`);
        this.rowConditions[`${row} ${col} ${num}`].push(`p${row} ${col}`);
      }
    }
    // FILL DEFAULT SUDOKU
    for (let i = 0; i < 81; i++) {
      const [row, col, block] = [getRow(i), getCol(i), getBlock(i)];
      if (sudoku[i] !== '.') {
        this.deleteRow(`${row} ${col} ${sudoku[i]}`);
      }
    }
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
    // htmlLog(row, cols);
    for (let a = 0; a < cols.length; a++) {
      const rows = this.colConditions[cols[a]];
      // htmlLog(cols[a], ": ", rows);
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
    // htmlLog(lvl, this.nAvailableCol);
    const cols = Object.keys(this.colConditions);
    if (this.nAvailableCol === 0) {
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
        // htmlLog(cols[i], rows[j]);
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
      cy.log(r, c, n);
    }
  }

  getSolution = () => {
    return this.solution;
  }
}

export default SudokuSolver;