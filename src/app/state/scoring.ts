import { Die, Dice, DiceX } from './dice';
import * as _ from 'lodash';

export interface ScoreSlots {
    ones?: number;
    twos?: number;
    threes?: number;
    fours?: number;
    fives?: number;
    sixes?: number;
    threeOfAKind?: number;
    fourOfAKind?: number;
    fullHouse?: number;
    smallStraight?: number;
    largeStraight?: number;
    yahtzee?: number;
    chance?: number;
    bonus?: number;
};

export type ScoreSlotKey = keyof ScoreSlots;

export const UpperScoreSlotKeys: ScoreSlotKey[] = [
    "ones",
    "twos",
    "threes",
    "fours",
    "fives",
    "sixes"
];

export const LowerScoreSlotKeys: ScoreSlotKey[] = [
    "threeOfAKind",
    "fourOfAKind",
    "fullHouse",
    "smallStraight",
    "largeStraight",
    "yahtzee",
    "chance",
    "bonus"
];

export const ScoreSlotKeys: ScoreSlotKey[] = [
    ...UpperScoreSlotKeys,
    ...LowerScoreSlotKeys
];

const ScoreSlotTitles = new Map<ScoreSlotKey, string>([
    ["ones", "Ones"],
    ["twos", "Twos"],
    ["threes", "Threes"],
    ["fours", "Fours"],
    ["fives", "Fives"],
    ["sixes", "Sixes"],
    ["threeOfAKind", "Three of a Kind"],
    ["fourOfAKind", "Four of a Kind"],
    ["fullHouse", "Full House"],
    ["smallStraight", "Small Straight"],
    ["largeStraight", "Large Straight"],
    ["yahtzee", "Yahtzee"],
    ["chance", "Chance"],
    ["bonus", "Bonus"]
]);

export interface ScoreTotals {
    upperSubTotal: number;
    upperBonus: undefined|number;
    upperTotal: number;
    lowerTotal: number;
    total: number;
}

export class ScoreSlots {

    static getTotals(current: ScoreSlots): ScoreTotals {
        const upperSubTotal =
            _(UpperScoreSlotKeys)
            .map(k => current[k] || 0)
            .sum();

        const upperBonus = upperSubTotal >= 63 ? 35 : undefined;
        const upperTotal = upperSubTotal + (upperBonus || 0);

        const lowerTotal =
            _(LowerScoreSlotKeys)
            .map(k => current[k] || 0)
            .sum();

        const total = upperTotal + lowerTotal;

        return {
            upperSubTotal,
            upperBonus,
            upperTotal,
            lowerTotal,
            total
        };
    }

    static getTitle(k: ScoreSlotKey): string {
        return ScoreSlotTitles.get(k) as string;
    }

    static create(): ScoreSlots {
        return {};
    }

    static getScore(scoreSlots: ScoreSlots, key: ScoreSlotKey): number|undefined {
        return scoreSlots[key];
    }

    static getPossibleScores(current: ScoreSlots, dice: Dice): ScoreSlots {
        const allPossible = ScoreSlots.getAllPossibleScores(dice);
        const possible: ScoreSlots = {};

        // Standard copy of score slots.
        ScoreSlotKeys.forEach(k => {
            if (current[k] === undefined && allPossible[k] !== undefined && k != 'bonus') {
                possible[k] = allPossible[k];
            }
        });

        // Bonus is special because you can have unlimited bonuses.
        if (current.yahtzee !== undefined &&
            current.yahtzee > 0 &&
            allPossible.yahtzee !== undefined &&
            allPossible.yahtzee > 0)
        {
            possible.bonus = (current.bonus || 0) + 100;
        }

        return possible;
    }

    static getAllPossibleScores(dice: Dice): ScoreSlots {
        function getDieCountScore(dieCounts: Map<Die, number>, die: Die): number {
            const dc = dieCounts.get(die) || 0;
            return dc * die;
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
            if (dieCounts.size == 2) {
                for (const [d, n] of dieCounts) {
                    return (n == 2 || n == 3);
                }
            }
            return false;
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
            chance: diceSum
        };
    }
}