import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { GameStateModel } from 'app/state/game-state';
import { LoadGameAction, RollUnselectedDiceAction, StartGameAction } from 'app/state/actions';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {

  gameState$: Observable<GameStateModel>;

  constructor(private store: Store) {
    this.gameState$ = store.select(state => state.game);
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