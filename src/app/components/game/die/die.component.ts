import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { GameStateModel } from 'app/state/game-state';
import { Die, DieNumber } from 'app/state/dice';
import { SetDieSelectionAction } from 'app/state/actions';

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
    return GameStateModel.isDieSelected(this.gameState, this.dieNumber as DieNumber);
  }

  toggleSelect() {
    console.log("Selecting die: " + this.dieNumber);
    this.store.dispatch(new SetDieSelectionAction(this.dieNumber as DieNumber, !this.isDieSelected()));
  }
}
