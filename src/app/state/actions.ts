/**
 * The actions of the game.
 */
import { ScoreSlotKey } from "app/state/scoring";
import { DieNumber } from "app/state/dice";

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
        public readonly dieNumber: DieNumber,
        public readonly selected: boolean
    ) {}
}

export class ChooseScoreSlotAction {
    static readonly type = '[Game] AddScoreSlot';

    constructor(
        public readonly scoreSlot: ScoreSlotKey
    ) {}
}
