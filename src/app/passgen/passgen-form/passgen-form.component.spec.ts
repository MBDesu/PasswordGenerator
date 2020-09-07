import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PassgenFormComponent } from './passgen-form.component';

describe('PassgenFormComponent', () => {
  let component: PassgenFormComponent;
  let fixture: ComponentFixture<PassgenFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PassgenFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PassgenFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
