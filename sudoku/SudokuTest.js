import { SUDOKU_9X9 } from "../constants/constants";
import SudokuSolver from "./SudokuSolver";

class SudokuTest {
  constructor(url, config = SUDOKU_9X9) {
    this.sudoku = '';
    this.sudokuSolver = new SudokuSolver();
    this.url = url;
    this.config = config;
  }

  visit() {
    cy.visit(this.url);
  }

  getCells(type = '.selectable') {
    return cy.get('#game').find(type);
  }

  solveSudoku() {
    cy.get('@sudoku').then(sudoku => {
      this.sudokuSolver.build(sudoku, this.config);
      this.sudokuSolver.solve();
      const solution = this.sudokuSolver.getSolution();
      cy.log(solution);
      this.getCells().then(cells => {
        for (let i = 0; i < cells.length; i++) {
          if (i >= solution.length) continue;
          const classList = cells[i].classList.value;
          if (classList.indexOf('task') === -1) {
            const [,, n] = solution[i].split(' ');
            cy.wait(500);
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