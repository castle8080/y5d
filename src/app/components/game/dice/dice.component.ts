/**
 * Displays the dice.
 */
import { Component, OnInit, Input } from '@angular/core';
import { Select, Store } from '@ngxs/store';

import { GameStateModel } from 'app/state/game-state';

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.css']
})
export class DiceComponent implements OnInit {

  @Input()
  gameState!: GameStateModel; 

  constructor(private store: Store) {
  }

  ngOnInit(): void {
  }

}
