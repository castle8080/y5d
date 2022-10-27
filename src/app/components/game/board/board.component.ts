import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Store } from '@ngxs/store';
import { GameStateModel, ScoreSlots } from 'src/app/state/game-state';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  @Input()
  gameState!: GameStateModel;

  possibleRollScores!: ScoreSlots;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.possibleRollScores = GameStateModel.getPossibleScoreSlots(this.gameState);
  }
}
