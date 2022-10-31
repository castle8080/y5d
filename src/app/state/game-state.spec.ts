import { GameStateModel } from './game-state';

describe('GameStateModel', () => {

  beforeEach(async () => {
  });

  it('should have bonus', () => {
    let gs = GameStateModel.create();
    gs = {
        ...gs,
        scoreSlots: {
            "yahtzee": 50
        },
        dice: [1,1,1,1,1]
    };

    const pScores = GameStateModel.getPossibleScoreSlots(gs);
    expect(pScores.bonus).toEqual(100);
  });
});
