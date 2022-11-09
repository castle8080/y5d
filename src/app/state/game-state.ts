/**
 * Contains the definition of the game state and a definition
 * for a store to interact with the state using NGXS.
 */
import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import * as _ from 'lodash';

import { DieNumber, Dice, DiceX } from './dice';
import {
    ScoreSlotKey,
    ScoreSlots,
    ScoreSlotKeys
} from './scoring';

import {
    LoadGameAction,
    RollUnselectedDiceAction,
    SetDieSelectionAction,
    StartGameAction,
    ChooseScoreSlotAction
} from './actions';

export interface GameStateModel {
    startTime: Date;
    endTime?: Date;
    rollCount: number;
    dice: Dice;
    selectedDice: number[];
    scoreSlots: ScoreSlots;
}

export class GameStateModel {

    static isDieSelected(gs: GameStateModel, dieNumber: DieNumber) {
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
            scoreSlots: new ScoreSlots()
        }
    }

    static getPossibleScoreSlots(gs: GameStateModel): ScoreSlots {
        return ScoreSlots.getPossibleScores(gs.scoreSlots, gs.dice);
    }

    static setDieSelected(
        gs: GameStateModel, dieNumber: DieNumber,
        selected: boolean) : GameStateModel
    {
        const isCurrentlySelected = GameStateModel.isDieSelected(gs, dieNumber);

        if (selected && !isCurrentlySelected) {
            return {
                ...gs,
                selectedDice: [...gs.selectedDice, dieNumber]
            };
        }
        else if (!selected && isCurrentlySelected) {
            return {
                ...gs,
                selectedDice: _.filter(gs.selectedDice, d => d != dieNumber)
            };
        }
        else {
            return gs;
        }
    }

    static rollUnselectedDice(gs: GameStateModel): GameStateModel {
        // You can only take 3 rolls!
        if (!GameStateModel.isRollable(gs)) {
            throw Error(`A roll cannot be made at this time.`)
        }

        const newDice = _.map(gs.dice, (die, dieNumber) =>
            (GameStateModel.isDieSelected(gs, dieNumber as DieNumber))
                ? die
                : DiceX.rollOne()
        ) as Dice;

        return {
            ...gs,
            dice: newDice,
            rollCount: gs.rollCount + 1
        };
    }

    static isGameComplete(gs: GameStateModel) {
        for (const k of ScoreSlotKeys) {
            if (k !== "bonus" && gs.scoreSlots[k] === undefined) {
                return false;
            }
        }
        return true;
    }

    static chooseScoreSlot(gs: GameStateModel, scoreSlot: ScoreSlotKey): GameStateModel {
        const possibleScores = GameStateModel.getPossibleScoreSlots(gs);

        if (possibleScores[scoreSlot] === undefined) {
            throw new Error(`Invalid score slot selection: ${scoreSlot}`);
        }

        const newScoreSlots: ScoreSlots = { ...gs.scoreSlots };
        newScoreSlots[scoreSlot] = possibleScores[scoreSlot];

        let ngs = { ...gs, scoreSlots: newScoreSlots };

        // Auto roll next turn.
        if (!GameStateModel.isGameComplete(ngs)) {
            ngs = {
                ...ngs,
                rollCount: 1,
                dice: DiceX.rollAll(),
                selectedDice: []
            };
        }
        else {
            ngs = { ...ngs, endTime: new Date() };
        }

        return ngs;
    }
}

@State<GameStateModel>({ name: 'game', defaults: GameStateModel.create() })
@Injectable()
export class GameState {
    
    @Action(LoadGameAction)
    loadGame(ctx: StateContext<GameStateModel>) {
        const gs = ctx.getState();
        if (!GameStateModel.isGameStarted(gs)) {
            // Auto start a new game.
            ctx.setState({ ...gs, rollCount: 1, dice: DiceX.rollAll() });
        }
    }

    @Action(StartGameAction)
    startGame(ctx: StateContext<GameStateModel>) {
        // Create a new game with the initial roll.
        const gs = GameStateModel.create();
        ctx.setState({ ...gs, rollCount: 1 });
    }

    @Action(SetDieSelectionAction)
    setDieSelection(ctx: StateContext<GameStateModel>, action: SetDieSelectionAction) {
        ctx.setState(GameStateModel.setDieSelected(
            ctx.getState(),
            action.dieNumber,
            action.selected
        ));
    }

    @Action(RollUnselectedDiceAction)
    rollUnselectedDice(ctx: StateContext<GameStateModel>) {
        ctx.setState(GameStateModel.rollUnselectedDice(
            ctx.getState()
        ));
    }

    @Action(ChooseScoreSlotAction)
    chooseScoreSlot(ctx: StateContext<GameStateModel>, action: ChooseScoreSlotAction) {
        ctx.setState(GameStateModel.chooseScoreSlot(
            ctx.getState(),
            action.scoreSlot
        ));
    }
}