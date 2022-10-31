import { GameStateModel } from './game-state';
import { Dice, DiceX } from './dice';
import { ScoreSlots } from './scoring';
import * as _ from 'lodash';

describe('GameStateModel', () => {

  beforeEach(async () => {
  });

  describe('scoring', () => {

    const getPossible = (dice: Dice, scoreSlots: ScoreSlots) => {
      let gs = GameStateModel.create();
      gs = {
        ...gs,
        scoreSlots: scoreSlots,
        dice: dice
      };
      return GameStateModel.getPossibleScoreSlots(gs);
    };

    it('should have 1 bonus after a yahtzee', () => {
      const pScores = getPossible([1,1,1,1,1], { yahtzee: 50 });
      expect(pScores.bonus).toEqual(100);
    });
  
    it('should have 200 possible after 1 bonus', () => {
      const pScores = getPossible([6,6,6,6,6], { yahtzee: 50, bonus: 100 });
      expect(pScores.bonus).toEqual(200);
    });
  
    it('should not have bonus if no yahtzee', () => {
      const pScores = getPossible([1,1,1,1,1], { });
      expect(pScores.bonus).toBeUndefined();
    })

    it('should not have bonus if the yahtzee was scratched', () => {
      const pScores = getPossible([1,1,1,1,1], { yahtzee: 0 });
      expect(pScores.bonus).toBeUndefined();
    })

    it('should not have bonus after yahtzee and no yahtzee on current roll', () => {
      // I had a bug with this.
      const pScores = getPossible([1,1,1,1,6], { yahtzee: 50 });
      expect(pScores.bonus).toBeUndefined();
    })

    it('should have a full house', () => {
      const pScores = getPossible([1,6,1,6,1], { });
      expect(pScores.fullHouse).toBe(25);
    })

    it('should not have a full house', () => {
      // I had a bug with 4 of a kind showing up as a full house.
      const pScores = getPossible([1,6,1,1,1], { });
      expect(pScores.fullHouse).toBe(0);
    })

    it('should not be a full house on a yahtzee', () => {
      // I think there is argument over this
      const pScores = getPossible([1,1,1,1,1], { });
      expect(pScores.fullHouse).toBe(0);
    })

    it('should not have a possible full house if there already was one', () => {
      const pScores = getPossible([1,4,1,1,4], { fullHouse: 25 });
      expect(pScores.fullHouse).toBeUndefined();
    })

    it('should have the sum of all dice on 3 of a kind', () => {
      const dice: Dice = [3,3,3,DiceX.rollOne(),DiceX.rollOne()];
      const pScores = getPossible(dice, { });
      expect(pScores.threeOfAKind).toBe(_.sum(dice));
    })

    it('should have the sum of all dice on 4 of a kind', () => {
      const dice: Dice = [3,3,3,DiceX.rollOne(),3];
      const pScores = getPossible(dice, { });
      expect(pScores.fourOfAKind).toBe(_.sum(dice));
    })

    it('should have the sum of all dice for chance', () => {
      const dice: Dice = DiceX.rollAll();
      const pScores = getPossible(dice, { });
      expect(pScores.chance).toBe(_.sum(dice));
    })

    it('should have a possible 0 on no dice match', () => {
      const pScores = getPossible([1,4,1,1,4], { });
      // check a few attributes
      expect(pScores.twos).toBe(0);
      expect(pScores.threes).toBe(0);
      expect(pScores.fives).toBe(0);
      expect(pScores.sixes).toBe(0);
      expect(pScores.fourOfAKind).toBe(0);
      expect(pScores.smallStraight).toBe(0);
      expect(pScores.largeStraight).toBe(0);
      expect(pScores.yahtzee).toBe(0);
    })

    it('should not have number slots if already taken', () => {  
      const pScores = getPossible([1,2,3,4,5], {
        ones: 1, twos: 4, threes: 9, fours: 16, fives: 25
      });
      expect(pScores.ones).toBeUndefined();
      expect(pScores.twos).toBeUndefined();
      expect(pScores.threes).toBeUndefined();
      expect(pScores.fours).toBeUndefined();
      expect(pScores.fives).toBeUndefined();
      expect(pScores.sixes).toBe(0);
    })
  });
});
