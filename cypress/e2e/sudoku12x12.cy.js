import { SUDOKU_12X12 } from '../../constants/constants';
import SudokuTest from '../../sudoku/SudokuTest';

Cypress._.times(1, (testIndex) => {
  describe('Sudoku X-Algorithm Test', () => {
    it('Fill', () => {
      Cypress.on('uncaught:exception', (err, runnable) => {
        return false
      });
      const sudokuTest = new SudokuTest('https://www.puzzle-sudoku.com/?size=6', SUDOKU_12X12);
      if (testIndex === 0) {
        // GO TO SUDOKU PAGE
        sudokuTest.visit();
      } else {
        // NEW SUDOKU
        sudokuTest.newSudoku();
      }
      // SELECT CELLS
      sudokuTest.getSudoku();
      // SOLVE SUDOKU
      sudokuTest.solveSudoku();
      // SUBMIT SOLUTION
      // sudokuTest.submitSolution();
      // VERIFY SOLUTION
      // sudokuTest.verifySuccess();
    });
  });
});