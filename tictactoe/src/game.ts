import 'phaser';

import Fade from 'phaser3-rex-plugins/plugins/fade';

import State from './lib/State';
import AI from './lib/AI';
import * as utils from './lib/utils';

import { Cell } from './lib/types';

interface SceneState {
  colWidth: number;
  rowHeight: number;
  padding: number;
  maxWidth: number;
  maxHeight: number;
  cntSquaresHor: number;
  cntSquaresVer: number;
  gameOver: boolean;
  playerScore: number;
  aiScore: number;
  // Game over screen
  gameOverOverlay: any;
  gameOverText: any;
  restartButton: any;
  playerScoreText: any;
  aiScoreText: any;
}

export default class Scene extends Phaser.Scene {
  graphics: any;
  board: Cell[][];
  winCnt: number;
  state: SceneState;
  gameState: State;
  ai: AI;

  constructor() {
    super('game');

    this.gameState = new State();

    this.state = {
      colWidth: 0,
      rowHeight: 0,
      padding: 0,
      maxWidth: 0,
      maxHeight: 0,
      cntSquaresHor: 0,
      cntSquaresVer: 0,
      gameOver: false,
      playerScore: 0,
      aiScore: 0,
      gameOverOverlay: null,
      gameOverText: null,
      restartButton: null,
      playerScoreText: null,
      aiScoreText: null,
    };
  }

  setup = () => {
    this.graphics = this.add.graphics();
    this.winCnt = 3;

    this.state.maxWidth = this.cameras.main.width;
    this.state.maxHeight = this.cameras.main.height;
    this.state.cntSquaresHor = 3;
    this.state.cntSquaresVer = 3;

    const baseFont = 'bold 32px Arial';
    const style = { font: baseFont, fill: '#000' };
    const scoreStyle = { font: '24px Arial', fill: '#333333' };
    const buttonStyle = { font: baseFont, fill: '#366f13' };
    const minWidth = this.cameras.main.worldView.x;
    const minHeight = this.cameras.main.worldView.y;
    const screenCenterX = minHeight + this.state.maxWidth / 2;
    const screenCenterY = minHeight + this.state.maxHeight / 2;

    //  The Text is positioned at center
    const text = this.add.text(screenCenterX, screenCenterY, 'Sudoku time!', style);
    // offset so the screen's centre would be in the center of the text
    text.setOrigin(0.5);
    text.setShadow(3, 3, 'rgba(0,0,0,0.25)', 2);

    this.state.colWidth = minWidth + this.state.maxWidth / this.state.cntSquaresHor;
    this.state.rowHeight = minHeight + this.state.maxHeight / this.state.cntSquaresVer;
    this.state.padding = Math.floor(Math.min(this.state.colWidth / 10, this.state.rowHeight / 10));

    // Create board mapping/storage
    this.gameState.board = utils.boardCreator(this.state.colWidth, this.state.rowHeight)(this.state.cntSquaresHor, this.state.cntSquaresVer);

    // Score text
    this.state.playerScoreText = this.add.text(0, 0, '', scoreStyle);
    this.state.aiScoreText = this.add.text(0, 32, '', scoreStyle);

    // Setup game over screen
    this.state.gameOverOverlay = this.add.rectangle(0, 0, this.state.maxWidth * 2, this.state.maxHeight * 2, 0xffffff, 0.75);
    this.state.gameOverText = this.add.text(screenCenterX, screenCenterY, '', style);
    this.state.restartButton = this.add.text(screenCenterX, screenCenterY + (this.state.padding * 3), 'Go again?', buttonStyle);
    this.state.gameOverText.setOrigin(0.5);
    this.state.restartButton.setOrigin(0.5);
    this.state.restartButton.setInteractive().on('pointerdown', () => {
      this._toggleGameOverVisibility();
      this.gameState = new State();
      this.gameState.board = utils.boardCreator(this.state.colWidth, this.state.rowHeight)(this.state.cntSquaresHor, this.state.cntSquaresVer);
      this.state.gameOverText.text = '';
      this.graphics.clear();

      setTimeout(() => { this.state.gameOver = false; }, 1000);
      this._createDrawLines(minHeight, minWidth);
    });
    this._toggleGameOverVisibility();

    // Difficulty select
    const easyButton = this.add.text(screenCenterX, screenCenterY + (this.state.padding * 3), 'Easy', { font: baseFont, fill: '#366f13' });
    const mediumButton = this.add.text(screenCenterX, screenCenterY + (this.state.padding * 5), 'Medium', { font: baseFont, fill: '#96600c' });
    const hardButton = this.add.text(screenCenterX, screenCenterY + (this.state.padding * 7), 'Hard', { font: baseFont, fill: '#9e350b' });
    easyButton.setOrigin(0.5);
    mediumButton.setOrigin(0.5);
    hardButton.setOrigin(0.5);
    const selectCb = (difficulty) => () => {
      // Fade out text
      new Fade(text, { start: 1, end: 0, delay: 50, duration: 500 }).start();
      new Fade(easyButton, { start: 1, end: 0, delay: 50, duration: 500 }).start();
      new Fade(mediumButton, { start: 1, end: 0, delay: 50, duration: 500 }).start();
      new Fade(hardButton, { start: 1, end: 0, delay: 50, duration: 500 }).start();
      this._createDrawLines(minHeight, minWidth);
      this.ai = new AI(difficulty, this.gameState);

      setTimeout(() => {
        this._handleUser();

        setTimeout(() => {
          this._updateScoreText();
        }, 250);
      }, 1000);
    };
    easyButton.setInteractive()
      .on('pointerdown', selectCb(0))
      .on('pointerover', () => easyButton.setColor('#264e0d').setShadow(0, 0, 'rgba(0,0,0,0.25)', 3))
      .on('pointerout', () => easyButton.setColor('#366f13').setShadow(0, 0, 'rgba(255,255,255,0.25)', 0));
    mediumButton.setInteractive()
      .on('pointerdown', selectCb(1))
      .on('pointerover', () => mediumButton.setColor('#764c0a').setShadow(0, 0, 'rgba(0,0,0,0.25)', 3))
      .on('pointerout', () => mediumButton.setColor('#96600c').setShadow(0, 0, 'rgba(255,255,255,0.25)', 0));
    hardButton.setInteractive()
      .on('pointerdown', selectCb(2))
      .on('pointerover', () => hardButton.setColor('#7c2909').setShadow(0, 0, 'rgba(0,0,0,0.25)', 3))
      .on('pointerout', () => hardButton.setColor('#9e350b').setShadow(0, 0, 'rgba(255,255,255,0.25)', 0));
  };

  gameOver = () => {
    let winnerText = 'DRAW';

    if (this.gameState.result === 'O-won') {
      winnerText = 'YOU WIN!';
      this.state.playerScore++;
    } else if (this.gameState.result === 'X-won') {
      winnerText = 'AI WINS!';
      this.state.aiScore++;
    }

    this._updateScoreText();
    this.state.gameOverText.text = winnerText;
    this._toggleGameOverVisibility();
  };

  create() {
    this.setup();
  }

  _createDrawLines = (minHeight: number, minWidth: number) => {
    // Create breakpoints
    const breakpoints = {
      // slice to remove the last one from the array, since we ain't puttin' lines at the bottom/right edge
      horizontal: Array(this.state.cntSquaresHor).fill(null).map((_, i) => this.state.colWidth * i + this.state.colWidth).slice(0, -1),
      vertical: Array(this.state.cntSquaresVer).fill(null).map((_, i) => this.state.rowHeight * i + this.state.rowHeight).slice(0, -1),
    };

    // Create the lines at breakpoints & fade in
    breakpoints.horizontal.map(b => {
      const line = new Phaser.Geom.Line(b, minHeight, b, this.state.maxHeight);
      this.graphics.lineStyle(2, 'rgb(0, 0, 0)');
      this.graphics.setAlpha(0.1);
      this.graphics.strokeLineShape(line);

      new Fade(this.graphics, { start: 0, end: 1, delay: 500, duration: 500 }).start();
    });
    breakpoints.vertical.map(b => {
      const line = new Phaser.Geom.Line(minWidth, b, this.state.maxWidth, b);
      this.graphics.lineStyle(2, 'rgb(0, 0, 0)');
      this.graphics.setAlpha(0.1);
      this.graphics.strokeLineShape(line);

      new Fade(this.graphics, { start: 0, end: 1, delay: 500, duration: 500 }).start();
    });
  };

  _updateScoreText = () => {
    this.state.playerScoreText.text = `You: ${this.state.playerScore}`;
    this.state.aiScoreText.text = `AI: ${this.state.aiScore}`;
  };

  _handleUser = () => {
    const updateBoard = utils.boardUpdater(this.graphics, this.state.colWidth, this.state.rowHeight, this.state.padding);

    // User interaction via clicking
    this.input.on('pointerdown', function (pointer) {
      if (this.state.gameOver) return;
      if (this.gameState.isAITurn) return;

      const { row, col } = utils.getCoords(pointer.downX, pointer.downY, this.state.colWidth, this.state.rowHeight);

      if (this.gameState.board[row][col].value !== '') return;

      if (pointer.downX <= this.state.maxWidth && pointer.downY <= this.state.maxHeight) {
        this.gameState.takeTurn(row, col);
        this.gameState.board = updateBoard(row, col, this.gameState.board);
      }

      if (this.gameState.terminal()) this.state.gameOver = true;
      else {
        const move = this.ai.move(this.gameState);

        this.gameState.takeTurn(move.row, move.col);
        this.gameState.board = updateBoard(move.row, move.col, this.gameState.board);

        if (this.gameState.terminal()) this.state.gameOver = true;
      }

      if (this.state.gameOver) this.gameOver();
    }, this);
  }

  _toggleGameOverVisibility = () => {
    this.state.gameOverOverlay.visible = !this.state.gameOverOverlay.visible;
    this.state.gameOverText.visible = !this.state.gameOverText.visible;
    this.state.restartButton.visible = !this.state.restartButton.visible;
  };
}

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#FFF',
    width: 800,
    height: 600,
    scale: {
      mode: Phaser.Scale.FIT,
    },
    scene: Scene,
};

const game = new Phaser.Game(config);
