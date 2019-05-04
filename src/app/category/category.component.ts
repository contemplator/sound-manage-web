import { Component, OnInit } from '@angular/core';
import { AppService } from 'app/app.service';
import { SoundCatrgory } from 'sound-manage-server/dist/models/sound';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  list: SoundCatrgory[] = [];
  cols: any[] = [];
  showAddModal = false;
  maxSequence = 0;
  fetchDone = false;

  constructor(
    private service: AppService
  ) { }

  ngOnInit() {
    this.initCols();
    this.fetchSoundCategoryList();
  }

  initCols(): void {
    this.cols = [
      { field: 'name', header: '中文名稱', width: 8 },
      { field: 'english_name', header: '英文名稱', width: 8 },
      { field: 'sequence', header: '排序', width: 8 },
      { field: 'sounds', header: '查看分類下音效', width: 8 }
    ];
  }

  fetchSoundCategoryList(): void {
    this.service.fetchSoundCatrgories().subscribe(res => {
      this.list = res;
      this.maxSequence = this.list.reduce((pre, cur) => {
        return cur.sequence > pre ? cur.sequence : pre;
      }, 0);
      this.fetchDone = true;
    });
  }

  onAdd(): void {
    this.showAddModal = false;
    this.fetchSoundCategoryList();
  }

}
