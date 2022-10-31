import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { DieComponent } from './die.component';
import { GameState, GameStateModel } from 'app/state/game-state';

describe('DieComponent', () => {
  let component: DieComponent;
  let fixture: ComponentFixture<DieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DieComponent ],
      imports: [
        NgxsModule.forRoot([GameState])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DieComponent);
    component = fixture.componentInstance;
    component.gameState = GameStateModel.create();
    component.die = 1;
    component.dieNumber = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
