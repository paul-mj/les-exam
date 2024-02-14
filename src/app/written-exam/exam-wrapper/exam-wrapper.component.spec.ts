import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamWrapperComponent } from './exam-wrapper.component';

describe('ExamWrapperComponent', () => {
  let component: ExamWrapperComponent;
  let fixture: ComponentFixture<ExamWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExamWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
