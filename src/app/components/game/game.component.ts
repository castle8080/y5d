import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { GameStateModel, LoadGameAction, RollUnselectedDiceAction, StartGameAction } from '../../state/game-state';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  gameState$: Observable<GameStateModel>;

  constructor(private store: Store) {
    this.gameState$ = store.select(state => state.game);
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadGameAction());
  }

  roll() {
    this.store.dispatch(new RollUnselectedDiceAction());
  }

  start() {
    this.store.dispatch(new StartGameAction());
  }
}