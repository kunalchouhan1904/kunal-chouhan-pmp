import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockExams } from './mock-exams';

describe('MockExams', () => {
  let component: MockExams;
  let fixture: ComponentFixture<MockExams>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockExams],
    }).compileComponents();

    fixture = TestBed.createComponent(MockExams);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
