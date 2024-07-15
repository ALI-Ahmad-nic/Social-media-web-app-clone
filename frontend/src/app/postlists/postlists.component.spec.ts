import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostlistsComponent } from './postlists.component';

describe('PostlistsComponent', () => {
  let component: PostlistsComponent;
  let fixture: ComponentFixture<PostlistsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostlistsComponent]
    });
    fixture = TestBed.createComponent(PostlistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
