import { Component, OnInit } from '@angular/core';
import { NavigationLink } from 'viewmodels/navigation-link';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  navigationLinks = [];

  constructor(
    private service: AppService
  ) { }

  ngOnInit(): void {
    this.initNavigations();
  }

  initNavigations(): void {
    this.navigationLinks = [
      new NavigationLink('List', 'list'),
      new NavigationLink('Upload', 'upload')
      // new NavigationLink('Edit', 'edit')
    ];
  }
}
