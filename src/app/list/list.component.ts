import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AppService } from '../app.service';
import { Sound } from 'viewmodels/sound';
import { Observable } from 'rxjs';
import { combineLatest, map } from 'rxjs/operators';
import * as WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, AfterViewInit {
  soundList = [];
  filtedSoundList = [];
  tagList = [];
  filtedTagList = [];
  keyword = '';

  constructor(
    private service: AppService
  ) { }

  ngOnInit() {
    this.fetchSource();
    this.fetchTagsList();
  }

  ngAfterViewInit(): void {
    requestAnimationFrame(() => {
      const wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple'
      });
      wavesurfer.load('https://www.dropbox.com/s/7u27ef92mw81m2b/Pokeman.mp3?dl=0');
    });
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
      if (!res.database) { res.database = []; }
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
      dropboxList = dropboxList.map(item => (new Sound()).parseFromDropbox(item));

      const arr = [...databaseList, ...dropboxList];
      this.soundList = arr.filter((item, index, arr) => arr.findIndex(s => s.id === item.id) === index);
      this.filtedSoundList = this.soundList;
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

  onTagsAdd(event, sound: Sound): void {
    this.service.updateSound(sound).subscribe(res => {
      console.info(res);
    });
  }

  onTagsRemove(event: any, sound: Sound): void {
    console.log(event, sound);
    this.service.deleteTag(sound.id, event).subscribe(res => {
      console.info(res);
    });
  }

  onDownloadClick(url: string): void {
    this.service.fetchDownloadLink(url).subscribe(res => {
      this.downloadFile(res);
    })
  }

  /**
   * 下載檔案
   */
  downloadFile(res: any): void {
    let link = window.document.createElement("a");
    link.setAttribute("href", res);
    link.setAttribute("download", res.name);
    link.click();
  }

  onKeywordChange(): void {
    this.filtedSoundList = this.soundList.filter(item => {
      if (item.name.toUpperCase().indexOf(this.keyword.toUpperCase()) > -1 || this.hasTag(item.tagsClouds, this.keyword)) {
        return true
      } else {
        return false;
      }
    });
  }

  hasTag(tags: string[], keyword: string): boolean {
    const index = tags.findIndex(item => {
      if (item.toUpperCase().indexOf(keyword.toUpperCase()) > -1) {
        return true;
      } else {
        return false;
      }
    })
    return index > -1 ? true : false;
  }

  fetchTagsList(): void {
    this.service.fetchTags().subscribe(res => {
      if(res){
        this.tagList = res.map(item => item.name);
      }else{
        this.tagList = [];
      }

    });
    // this.tagList = this.soundList.reduce((pre, cur) => {
    //   return [...pre, ...cur.tagsClouds];
    // }, []);

    // this.tagList = this.tagList.filter((item: string, index: number, arr: string[]) => {
    //   const fi = arr.indexOf(item);
    //   return index === fi ? true : false;
    // });
  }

  filterTag(event): void {
    const keyword = event.query.toUpperCase();
    this.filtedTagList = this.tagList.filter(item => {
      const index = item.toUpperCase().indexOf(keyword);
      return index > -1 ? true : false;
    });
  }
}
