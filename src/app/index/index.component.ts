import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  keyword = '';
  tagList = [];
  frontTaglist = [];
  filtedTagList = [];

  constructor(
    private service: AppService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchTags();
  }

  /**
   * 取得過去所有 tag
   */
  fetchTags(): void {
    this.service.fetchLabels().subscribe(res => {
      this.tagList = res.map(item => item.name);
      this.frontTaglist = this.tagList.slice(0, 20);
    });
  }

  /**
   * auto complete 篩選符合的 tag
   * @param event auto compelte 輸入事件
   */
  filterTag(event): void {
    const query = event.query;
    this.filtedTagList = this.tagList.filter(item => item.indexOf(query) > -1);
  }

  /**
   * auto complete enter 事件，過濾中文未完成輸入事件
   * @param event html keydown.enter 事件
   */
  onEnter(event): void {
    const keyCode = event.keyCode;
    if (keyCode === 13) {
      this.search(this.keyword);
    }
  }

  /**
   * 進入搜尋頁
   * @param keyword 關鍵字
   */
  search(keyword: string): void {
    this.router.navigate(['list', keyword]);
  }

}
