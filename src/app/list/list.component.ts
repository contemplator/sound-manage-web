import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { Sound } from 'viewmodels/sound';
import { combineLatest } from 'rxjs/operators';
import * as WaveSurfer from 'wavesurfer.js';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  soundList = [];
  filtedSoundList = [];
  tagList = [];
  filtedTagList = [];
  keyword = '';
  wavesurfer: any;

  constructor(
    private service: AppService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.fetchSource();
    this.fetchTagsList();
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
      console.log(this.soundList);
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

  onTagsAdd(sound: Sound): void {
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
      if (res) {
        this.tagList = res.map(item => item.name);
      } else {
        this.tagList = [];
      }
    });
  }

  filterTag(event): void {
    const keyword = event.query.toUpperCase();
    this.filtedTagList = this.tagList.filter(item => {
      const index = item.toUpperCase().indexOf(keyword);
      return index > -1 ? true : false;
    });
  }

  updateVoiceGraph(event: any, sound: Sound): void {
    this.service.fetchDownloadLink(sound.url).subscribe(res => {
      const target = event.target.parentNode.parentNode;
      target.innerHTML = '';
      const element = window.document.createElement('div');
      element.setAttribute('id', sound.id);
      target.appendChild(element);

      sound.wave = WaveSurfer.create({
        container: '#' + sound.id,
        waveColor: 'violet',
        progressColor: 'purple'
      });

      sound.wave.on('ready', () => {
        const waveElement = target.childNodes[0].childNodes[0];
        setTimeout(() => {
          const canvas = waveElement.querySelectorAll('canvas')[0];
          if (canvas.getContext) {
            var image = canvas.toDataURL("image/png");
            sound.graph = image;
            this.service.updateSound(sound).subscribe(res => {
            });
          }
        }, 300);

      });

      sound.wave.load(res);
    });
  }

  generateGraph(sound): void {
    this.service.fetchDownloadLink(sound.url).subscribe(res => {
      console.log(res);
      const target = document.body;
      const element = window.document.createElement('div');
      element.setAttribute('id', sound.id);
      target.appendChild(element);

      sound.wave = WaveSurfer.create({
        container: '#' + sound.id,
        waveColor: 'violet',
        progressColor: 'purple'
      });

      sound.wave.on('ready', () => {
        const waveElement = document.body.querySelector('#' + sound.id);
        setTimeout(() => {
          const canvas = waveElement.querySelectorAll('canvas')[0];
          if (canvas.getContext) {
            var image = canvas.toDataURL("image/png");
            sound.graph = image;
            sound.wave = null
            this.service.updateSound(sound).subscribe(res2 => {
              console.log(res2);
            }, error=>{
              console.log(error, sound)
            });
          }
        }, 300);

      });

      sound.wave.load(res);
    });
  }

  safeResource(resource: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(resource);
  }
}
