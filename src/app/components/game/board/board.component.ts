import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { GameStateModel } from 'app/state/game-state';
import * as scoring from 'app/state/scoring';
import { ChooseScoreSlotAction } from 'app/state/actions';

import * as _ from 'lodash';

type ScoreSlotViewType = 
    "score" |
    "possible" |
    "none";

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnChanges, OnInit {

  @Input()
  gameState!: GameStateModel;

  possibleRollScores!: scoring.ScoreSlots;
  totals!: scoring.ScoreTotals;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.recalculate();
  }

  ngOnChanges(): void {
    this.recalculate();
  }

  recalculate(): void {
    this.possibleRollScores = GameStateModel.getPossibleScoreSlots(this.gameState);
    this.totals = scoring.ScoreSlots.getTotals(this.gameState.scoreSlots);
  }

  scoreSlotSelected(k: scoring.ScoreSlotKey) {
    this.store.dispatch(new ChooseScoreSlotAction(k));
  }

  get UpperScoreSlotKeys() {
    return scoring.UpperScoreSlotKeys;
  }

  get LowerScoreSlotKeys() {
    return scoring.LowerScoreSlotKeys;
  }

  getScoreSlotTitle(k: scoring.ScoreSlotKey) {
    return scoring.ScoreSlots.getTitle(k);
  }

  getCurrentScore(k: scoring.ScoreSlotKey) {
    return this.gameState.scoreSlots[k];
  }

  getPossibleScore(k: scoring.ScoreSlotKey) {
    return this.possibleRollScores[k];
  }

  getScoreSlotViewType(k: scoring.ScoreSlotKey) {
    const cScore = this.gameState.scoreSlots[k];
    const pScore = this.possibleRollScores[k];
    if (pScore !== undefined) {
      return "possible"; 
    }
    else if (cScore !== undefined) {
      return "score";
    }
    else {
      return "none";
    }
  }
}
