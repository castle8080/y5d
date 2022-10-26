import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import * as _ from 'lodash';

export class LoadGameAction {
    static readonly type = '[Game] LoadGame';
}

export class StartGameAction {
    static readonly type = '[Game] StartGame';
}

export class RollUnselectedDiceAction {
    static readonly type = '[Game] Roll Unselected Dice';
}

export class SetDieSelectionAction {
    static readonly type = '[Game] SetDieSelection';

    constructor(
        public readonly dieNumber: number,
        public readonly selected: boolean
    ) {}
}

export type Die = 1|2|3|4|5|6;

export type Dice = [Die, Die, Die, Die, Die];

export class DiceX {

    public static rollOne(): Die {
        return Math.floor(Math.random() * 6 + 1) as Die;
    }

    public static rollN(n: number) {
        return _.range(0, n).map(i => DiceX.rollOne());
    }

    public static rollAll(): Dice {
        return DiceX.rollN(5) as Dice;
    }

}

export interface ScoreSlots {
    ones: number|null;
    twos: number|null;
    threes: number|null;
    fours: number|null;
    fives: number|null;
    sixes: number|null;
    threeOfAKind: number|null;
    fourOfAKind: number|null;
    fullHouse: number|null;
    shortStraight: number|null;
    straight: number|null;
    yahtzee: number|null;
    chance: number|null;
    bonus: number;
}

export class ScoreSlots {
    static create(): ScoreSlots {
        return {
            ones: null,
            twos: null,
            threes: null,
            fours: null,
            fives: null,
            sixes: null,
            threeOfAKind: null,
            fourOfAKind: null,
            fullHouse: null,
            shortStraight: null,
            straight: null,
            yahtzee: null,
            chance: null,
            bonus: 0
        };
    }
}

export interface GameStateModel {
    startTime: Date;
    rollCount: number;
    dice: Dice;
    selectedDice: number[];
    scoreSlots: ScoreSlots;
}

export class GameStateModel {

    static isDieSelected(gs: GameStateModel, dieNumber: number) {
        return gs.selectedDice.indexOf(dieNumber) >= 0;
    }

    static isGameStarted(gs: GameStateModel) {
        return gs.rollCount > 0;
    }

    static isRollable(gs: GameStateModel) {
        return gs.rollCount < 3;
    }

    static create(): GameStateModel {
        return {
            startTime: new Date(),
            rollCount: 0,
            dice: DiceX.rollAll(),
            selectedDice: [],
            scoreSlots: ScoreSlots.create()
        }
    }
}

@State<GameStateModel>({ name: 'game', defaults: GameStateModel.create() })
@Injectable()
export class GameState {
    
    @Action(LoadGameAction)
    load(ctx: StateContext<GameStateModel>) {
        const gs = ctx.getState();
        if (!GameStateModel.isGameStarted(gs)) {
            // Auto start a new game.
            ctx.setState({ ...gs, rollCount: 1, dice: DiceX.rollAll() });
        }
    }

    @Action(StartGameAction)
    start(ctx: StateContext<GameStateModel>) {
        // Create a new game with the initial roll.
        const gs = GameStateModel.create();
        ctx.setState({ ...gs, rollCount: 1 });
    }

    @Action(SetDieSelectionAction)
    setDieSelection(ctx: StateContext<GameStateModel>, action: SetDieSelectionAction) {
        const gs = ctx.getState();
        const isCurrentlySelected = GameStateModel.isDieSelected(gs, action.dieNumber);

        if (action.selected && !isCurrentlySelected) {
            ctx.setState({
                ...gs,
                selectedDice: [...gs.selectedDice, action.dieNumber]
            });
        }
        else if (!action.selected && isCurrentlySelected) {
            ctx.setState({
                ...gs,
                selectedDice: _.filter(gs.selectedDice, d => d != action.dieNumber)
            });
        }
    }

    @Action(RollUnselectedDiceAction)
    rollUnselectedDiceAction(ctx: StateContext<GameStateModel>) {
        const gs = ctx.getState();

        // You can only take 3 rolls!
        if (!GameStateModel.isRollable(gs)) {
            return;
        }

        const newDice = _.map(gs.dice, (die, dieNumber) =>
            (GameStateModel.isDieSelected(gs, dieNumber))
                ? die
                : DiceX.rollOne()
        ) as Dice;

        ctx.setState({
            ...gs,
            dice: newDice,
            rollCount: gs.rollCount + 1
        });
    }
}