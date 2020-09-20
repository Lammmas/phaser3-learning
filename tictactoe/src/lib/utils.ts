import { Cell } from './types';

export const getCoords = (x: number, y: number, colWidth: number = 0, rowHeight: number = 0) => ({
  col: Math.floor(x / colWidth),
  row: Math.floor(y / rowHeight),
});

export const boardUpdater = (graphics: any, colWidth: number = 0, rowHeight: number = 0, padding: number = 0) =>
  (row: number, col: number, board: Cell[][]) => {
    if (board[row][col].shown === true) return board;

    const cell = board[row][col];
    board[row][col].shown = true;

    // Add naughts/crosses
    graphics.lineStyle(3, 0x0, 1);
    const centerX = cell.minX + (colWidth / 2);
    const centerY = cell.minY + (rowHeight / 2);
    const radius = (Math.min(colWidth, rowHeight) - (2 * padding)) / 2;

    // 1 = X, -1 = O
    if (cell.value === 'X') {
      const line1 = new Phaser.Geom.Line(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      const line2 = new Phaser.Geom.Line(centerX + radius, centerY - radius, centerX - radius, centerY + radius);
      graphics.strokeLineShape(line1);
      graphics.strokeLineShape(line2);
    } else if (cell.value === 'O') {
      graphics.strokeCircleShape(new Phaser.Geom.Circle(centerX, centerY, radius));
    }

    return board;
};

export const boardCreator = (colWidth: number = 0, rowHeight: number = 0) => (width = 3, height = 3, breakpoints = { horizontal: [], vertical: [] }) => Array(height).fill(null).map((_, r) => {
  return Array(width).fill(null).map((_, c) => ({
    minX: Math.floor(c * colWidth),
    maxX: Math.floor(c * colWidth + colWidth - 1), // 1 px gap for line + prevent overlapping
    minY: Math.floor(r * rowHeight),
    maxY: Math.floor(r * rowHeight + rowHeight - 1),
    value: '',
    shown: false
  }));
});

export const sortActionsAsc = (first, second) => {
  if (first.score < second.score) return -1;
  if (first.score > second.score) return 1;
  else return 0;
};

export const sortActionsDesc = (first, second) => {
  if (first.score > second.score) return -1;
  if (first.score < second.score) return 1;
  else return 0;
};
