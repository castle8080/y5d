/**
 * This is the main component for a game.
 */
import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import * as rx from 'rxjs';

import { GameStateModel } from 'app/state/game-state';
import { LoadGameAction, RollUnselectedDiceAction, StartGameAction } from 'app/state/actions';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  gameState$: rx.Observable<GameStateModel>;
  gameComplete$: rx.Observable<boolean>;

  constructor(private store: Store) {
    this.gameState$ = store.select(state => state.game);
    this.gameComplete$ = this.gameState$.pipe(rx.map(gs => gs.endTime !== undefined));
    this.gameState$.subscribe(gs => {
      console.log("Game: ", gs);
    });
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