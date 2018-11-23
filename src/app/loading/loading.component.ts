import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  @Input() show = false;
  @Input() msg = '讀取中';

  constructor() { }

  ngOnInit() {
  }

}
