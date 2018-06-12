import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Observable } from 'rxjs';
import { combineLatest, map } from 'rxjs/operators';
import { Sound } from 'viewmodels/sound';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  soundList = [];

  constructor(
    private service: AppService
  ) { }

  ngOnInit() {
    this.fetchSource();
  }

  fetchSource(): void {
    const folderPath = '/0_Woolito Animation Team Folder/resource/音效/人、動物';
    const decodePath = encodeURIComponent(folderPath);
    const dropboxObservable = this.service.fetchDropboxFolder(decodePath);
    const databaseObservable = this.service.fetchDbSounds();
    const result = dropboxObservable.pipe(combineLatest(databaseObservable, (dbox, dbase) => {
      return {
        dropbox: dbox,
        database: dbase
      };
    })).subscribe(res => {
      const databaseList = res.database.map(item => (new Sound()).parseFromDatabase(item));
      let dropboxList = [];
      res.dropbox.forEach(item => {
        if (Array.isArray(item)) {
          const list = this.parseFolderToFiles(item);
          dropboxList = [...dropboxList, ...list];
        } else {
          dropboxList = [...dropboxList, item];
        }
      });
      dropboxList = dropboxList.map(item=>(new Sound()).parseFromDropbox(item));

      const arr = [...databaseList, ...dropboxList];
      this.soundList = arr.filter((item, index, arr) => arr.findIndex(s => s.id === item.id) === index);

    });
  }

  parseFolderToFiles(list: any[]): any[] {
    let result = [];
    list.forEach(item => {
      if (Array.isArray(item)) {
        let tempList = this.parseFolderToFiles(item);
        result = [...result, ...tempList];
      } else {
        result.push(item);
      }
    });
    return result;
  }

  showDatetime(datetime: Date): string {
    if (!datetime) { return ''; }
    return datetime.toFormatString('YYYY/MM/DD hh:mm:ss');
  }

  onTagsAdd(event: any, sound: Sound): void {
    this.service.updateSound(sound).subscribe(res => {
      console.log(res);
    });
  }

  onTagsRemove(event: any, sound: Sound): void {
    console.log(event, sound);
  }
}
