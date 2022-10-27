import { Injectable } from '@angular/core';
import { ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS } from '@angular/platform-browser-dynamic';
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

    public static getDieCounts(dice: Dice): Map<Die, number> {
        const dieCounts = new Map<Die, number>();
        dice.forEach(d => {
            dieCounts.set(d, (dieCounts.get(d) || 0) + 1);
        });
        return dieCounts;
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
    smallStraight: number|null;
    largeStraight: number|null;
    yahtzee: number|null;
    chance: number|null;
    bonus: number|null;
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
            smallStraight: null,
            largeStraight: null,
            yahtzee: null,
            chance: null,
            bonus: null
        };
    }

    static getPossibleScores(dice: Dice): ScoreSlots {
        function getDieCountScore(dieCounts: Map<Die, number>, die: Die): number|null {
            const dc = dieCounts.get(die);
            return (dc) ? dc! * die : null;
        }
    
        function getMaxDieCount(dieCounts: Map<Die, number>): [Die, number] {
            return _.maxBy([...dieCounts.entries()], ([d, dCount]) => dCount)!;
        }
    
        function sumDieCounts(dieCounts: Map<Die, number>): number {
            let score = 0;
            for (const [d, dCount] of dieCounts.entries()) {
                score += d * dCount;
            }
            return score;
        }

        function isFullHouse(dieCounts: Map<Die, number>): boolean {
            return dieCounts.size == 2;
        }

        function getMaxSequenceLength(dice: Dice) {
            let dieSorted = [...dice];
            dieSorted.sort();
            dieSorted = _.sortedUniq(dieSorted);
            let sequences: [number, number][] = [];
            let start = 0;
            
            for (let pos = 1; pos < dieSorted.length; pos++) {
                if (dieSorted[pos] != dieSorted[pos - 1] + 1) {
                    sequences.push([start, pos]);
                    start = pos;
                }
            }
            sequences.push([start, dieSorted.length]);
            return _(sequences).map(([s, e]) => e - s).max()!;
        }

        const dieCounts = DiceX.getDieCounts(dice);
        const [maxDieCountDie, maxDieCount] = getMaxDieCount(dieCounts);
        const diceSum = sumDieCounts(dieCounts);
        const maxSequenceLength = getMaxSequenceLength(dice);

        return {
            ones: getDieCountScore(dieCounts, 1),
            twos: getDieCountScore(dieCounts, 2),
            threes: getDieCountScore(dieCounts, 3),
            fours: getDieCountScore(dieCounts, 4),
            fives: getDieCountScore(dieCounts, 5),
            sixes: getDieCountScore(dieCounts, 6),
            threeOfAKind: maxDieCount >= 3 ? diceSum : 0,
            fourOfAKind: maxDieCount >= 4 ? diceSum : 0,
            fullHouse: isFullHouse(dieCounts) ? 25 : 0,
            smallStraight: maxSequenceLength >= 4 ? 30 : 0,
            largeStraight: maxSequenceLength >= 5 ? 40 : 0,
            yahtzee: maxDieCount >= 5 ? 50 : 0,
            chance: diceSum,
            bonus: null
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

    static getPossibleScoreSlots(gs: GameStateModel): ScoreSlots {
        const rollScores = ScoreSlots.getPossibleScores(gs.dice);
        const bonusAble =
            rollScores.yahtzee !== null &&
            gs.scoreSlots.yahtzee !== null &&
            gs.scoreSlots.yahtzee > 0;

        function pscore(current_score: number|null, roll_score: number|null): number|null {
            return (current_score === null) ? roll_score : null;
        }

        return {
            ones: pscore(gs.scoreSlots.ones, rollScores.ones),
            twos: pscore(gs.scoreSlots.twos, rollScores.twos),
            threes: pscore(gs.scoreSlots.threes, rollScores.threes),
            fours: pscore(gs.scoreSlots.fours, rollScores.fours),
            fives: pscore(gs.scoreSlots.fives, rollScores.fives),
            sixes: pscore(gs.scoreSlots.sixes, rollScores.sixes),
            threeOfAKind: pscore(gs.scoreSlots.threeOfAKind, rollScores.threeOfAKind),
            fullHouse: pscore(gs.scoreSlots.fullHouse, rollScores.fullHouse),
            fourOfAKind: pscore(gs.scoreSlots.fourOfAKind, rollScores.fourOfAKind),
            smallStraight: pscore(gs.scoreSlots.smallStraight, rollScores.smallStraight),
            largeStraight: pscore(gs.scoreSlots.largeStraight, rollScores.largeStraight),
            yahtzee: pscore(gs.scoreSlots.yahtzee, rollScores.yahtzee),
            chance: pscore(gs.scoreSlots.chance, rollScores.chance),
            bonus: bonusAble ? (gs.scoreSlots.bonus || 0) + 50 : gs.scoreSlots.bonus
        };
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