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
    const dropboxObservable = this.service.fetchDropboxFolder();
    const databaseObservable = this.service.fetchDbSounds();
    const result = dropboxObservable.pipe(combineLatest(databaseObservable, (dbox, dbase) => {
      return {
        dropbox: dbox,
        database: dbase
      };
    })).subscribe(res => {
      const dropbox = res.dropbox.map(item => (new Sound()).parseFromDropbox(item));
      const database = res.database.map(item => (new Sound()).parseFromDatabase(item));

      console.log(dropbox, database);
      const arr = [...database, ...dropbox];
      this.soundList = arr.filter((item, index, arr) => arr.findIndex(s => s.id === item.id) === index);
      console.log(this.soundList);
    });
  }

  showDatetime(datetime: Date): string {
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
