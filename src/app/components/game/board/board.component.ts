import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { GameStateModel } from 'src/app/state/game-state';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  @Input()
  gameState!: GameStateModel;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

}
