import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { BoardComponent } from './board.component';
import { GameState, GameStateModel } from 'app/state/game-state';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  function getRowScoreCells(cDom: HTMLElement): Map<string, HTMLTableCellElement> {
    let scoreCells = new Map<string, HTMLTableCellElement>();
    cDom.querySelectorAll("tr").forEach(tr => {
      let headerCell = tr.querySelector('th');
      let valueCell = tr.querySelector('td');
      if (headerCell && valueCell) {
        if (headerCell.textContent != null && headerCell.textContent.trim().length > 0) {
          scoreCells.set(headerCell.textContent.trim(), valueCell);
        }
      }
    });
    return scoreCells;
  }   

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoardComponent ],
      imports: [
        NgxsModule.forRoot([GameState])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    component.gameState = GameStateModel.create();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have possible score for full house', () => {
    const gs: GameStateModel = {
      ...component.gameState,
      rollCount: 1,
      dice: [1,1,1,2,2]
    };

    component.gameState = gs;
    component.ngOnChanges();
    fixture.detectChanges();

    const cDom: HTMLElement = fixture.nativeElement;
    const scoreCells = getRowScoreCells(cDom);
    const fullHouseCell = scoreCells.get("Full House")!;

    expect(fullHouseCell).toBeTruthy();
    expect(fullHouseCell.textContent).toBe("25");
  })
});
