import SudokuSolver from "./SudokuSolver";

class SudokuTest {
  constructor() {
    this.sudoku = '';
    this.sudokuSolver = new SudokuSolver();
  }

  visit() {
    cy.visit('https://www.puzzle-sudoku.com/?size=9');
  }

  getCells(type = '.selectable') {
    return cy.get('#game').find(type);
  }

  solveSudoku() {
    cy.get('@sudoku').then(sudoku => {
      this.sudokuSolver.build(sudoku);
      this.sudokuSolver.solve();
      const solution = this.sudokuSolver.getSolution();
      this.getCells().then(cells => {
        for (let i = 0; i < cells.length; i++) {
          const classList = cells[i].classList.value;
          if (classList.indexOf('task') === -1) {
            const [, , n] = solution[i].split(' ');
            cy.wait(1000);
            cy.wrap(cells[i]).click().type(n);
          }
        }
      });
    })
  }

  getSudoku() {
    this.getCells().then(cells => {
      let sudoku = '';
      for (let i = 0; i < cells.length; i++) {
        const classList = cells[i].classList.value;
        if (classList.indexOf('task') >= 0) {
          sudoku = sudoku + cells[i].textContent;
        } else {
          sudoku = sudoku + '.';
        }
      }
      cy.wrap(sudoku).as('sudoku');
    });
  }

  submitSolution() {
    cy.get('#btnReady').click();
  }

  newSudoku() {
    cy.get('#btnNew').click();
  }

  printSudoku() {
    cy.get('@sudoku').then(sudoku => cy.log(sudoku));
  }

  verifySuccess() {
    cy.get('.succ').contains('Congratulations!');
  }
}

export default SudokuTest;