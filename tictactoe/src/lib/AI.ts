import State, { AvailablePosition } from './State';
import { sortActionsAsc, sortActionsDesc } from './utils';

export default class AI {
  move: (state: State) => AvailablePosition;

  constructor(level: number, state: State) {
    if (level >= 2) this.move = this.masterMove;
    else if (level <= 0) this.move = this.blindMove;
    else this.move = this.noviceMove;
  }

  blindMove = (state: State): AvailablePosition => {
    const available = state.getAvailablePositions();
    const randomCell = available[Math.floor(Math.random() * available.length)];
    return randomCell;
  };

  noviceMove = (state: State): AvailablePosition => {
    const actions = this._getAvailableActions(state);

    let chosen;

    // Take the optimal action 40% of the time, and take the 1st suboptimal action 60% of the time (if possible)
    if (Math.random() * 100 <= 40 || actions.length < 2) chosen = actions[0];
    else chosen = actions[1];

    return chosen.move;
  };

  masterMove = (state: State): AvailablePosition => {
    const actions = this._getAvailableActions(state);

    return actions[0].move;
  };

  _getAvailableActions = (state: State) => {
    const available = state.getAvailablePositions();
    const actions = available.map(move => {
      const newState = new State(state);
      newState.takeTurn(move.row, move.col);
      const score = this._minimaxValue(newState);

      return { score, move };
    });

    if (state.isAITurn) actions.sort(sortActionsDesc);
    else actions.sort(sortActionsAsc);

    return actions;
  };

  _minimaxValue = (state: State): number => {
    if (state.terminal()) return state.score;

    let score = 0;

    // X wants to maximize --> initialize to a value smaller than any possible score
    if (state.isAITurn) score = -1000;
    // O wants to minimize --> initialize to a value larger than any possible score
    else score = 1000;

    const availablePositions = state.getAvailablePositions();
    const availableNextStates = availablePositions.map(pos => {
      const newState = new State(state);
      newState.takeTurn(pos.row, pos.col);

      return newState;
    });

    availableNextStates.forEach(nextState => {
      const nextScore = this._minimaxValue(nextState);

      // X wants to maximize --> update score if nextScore is larger
      // O wants to minimize --> update score if nextScore is smaller
      if ((state.isAITurn && nextScore > score) ||
        (!state.isAITurn && nextScore < score)) score = nextScore;
    });

    return score;
  }
}
