import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';

import { GameState } from './state/game-state';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';

import { environment } from '../environments/environment';
import { GameComponent } from './components/game/game.component';
import { DiceComponent } from './components/game/dice/dice.component';
import { DieComponent } from './components/game/die/die.component';
import { BoardComponent } from './components/game/board/board.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    GameComponent,
    DiceComponent,
    DieComponent,
    BoardComponent
  ],
  imports: [
    NgxsModule.forRoot([GameState], {
      developmentMode: !environment.production
    }),
    BrowserModule,
    AppRoutingModule,
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
