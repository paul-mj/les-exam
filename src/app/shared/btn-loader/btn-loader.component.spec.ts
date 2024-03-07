import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnLoaderComponent } from './btn-loader.component';

describe('BtnLoaderComponent', () => {
  let component: BtnLoaderComponent;
  let fixture: ComponentFixture<BtnLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnLoaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BtnLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
