import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { Die, GameState, GameStateModel, SetDieSelectionAction } from 'src/app/state/game-state';

@Component({
  selector: 'app-die',
  templateUrl: './die.component.html',
  styleUrls: ['./die.component.css']
})
export class DieComponent implements OnInit {

  @Input()
  gameState!: GameStateModel;

  @Input()
  die!: Die;

  @Input()
  dieNumber!: number;

  constructor(private store: Store) {
  }

  ngOnInit(): void {
  }

  isDieSelected() {
    return GameStateModel.isDieSelected(this.gameState, this.dieNumber);
  }

  toggleSelect() {
    console.log("Selecting die: " + this.dieNumber);
    this.store.dispatch(new SetDieSelectionAction(this.dieNumber, !this.isDieSelected()));
  }
}
