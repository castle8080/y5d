/**
 * Basic operations and definitions for dice.
 */
import * as _ from 'lodash';

export type Die = 1|2|3|4|5|6;

export type Dice = [Die, Die, Die, Die, Die];

export type DieNumber = 0|1|2|3|4;

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