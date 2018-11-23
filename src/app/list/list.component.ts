import { Component, OnInit, NgZone, isDevMode } from '@angular/core';
import { AppService } from '../app.service';
import { Sound } from 'viewmodels/sound';
import * as WaveSurfer from 'wavesurfer.js';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  soundList: Sound[] = [];          // 所有音效檔案
  filtedSoundList = [];             // 篩選後的音效檔案
  tagList = [];                     // 標籤列表
  filtedTagList = [];               // 篩選後的標籤列表
  keyword = '';                     // 關鍵字
  wavesurfer: any;                  // 產生音波圖的物件
  showLoading = false;              // 是否顯示讀取中

  constructor(
    private service: AppService,
    private sanitizer: DomSanitizer,
    private zone: NgZone,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    const keyword = this.route.snapshot.paramMap.get('keyword');
    this.keyword = keyword;
    this.fetchAllSound();
    this.fetchTagsList();
  }

  /**
   * 停用
   * 查詢音效
   */
  fetchSounds(): void {
    this.showLoading = true;
    this.service.fetchSounds(this.keyword).subscribe(res => {
      this.filtedSoundList = res.map(item => (new Sound()).parseFromDatabase(item));
      this.showLoading = false;
    });
  }

  /**
   * 取得 db 內的音效資料
   */
  fetchAllSound(): void {
    this.showLoading = true;
    this.service.fetchAllSounds().subscribe(res => {
      if (res) {
        res = res.map(item => (new Sound()).parseFromDatabase(item));
        this.soundList = [...this.soundList, ...res];
        this.filtedSoundList = this.soundList;
        this.showLoading = false;
      }

      this.onKeywordChange();
    });
  }

  /**
   * 顯示時間
   */
  showDatetime(datetime: Date): string {
    if (!datetime) { return ''; }
    return datetime.toFormatString('YYYY/MM/DD hh:mm:ss');
  }

  /**
   * 新增標籤
   * @param sound 音效檔案
   */
  onTagsAdd(sound: Sound): void {
    this.service.updateSound(sound).subscribe(res => {
      if (!res) {
        console.error(res, sound);
      }
    });
  }

  /**
   * 刪除標籤
   * @param event 事件
   * @param sound 要刪除標籤的音效檔案
   */
  onTagsRemove(event: any, sound: Sound): void {
    this.service.deleteTag(sound.id, event).subscribe(res => {
      console.info(res);
    });
  }

  /**
   * 點擊下載
   * @param url dropbox 檔案的路徑
   */
  onDownloadClick(url: string): void {
    this.service.fetchDownloadLink(url).subscribe(res => {
      this.downloadFile(res);
    })
  }

  /**
   * 下載檔案
   * @param res api 回傳的結果
   */
  downloadFile(res: any): void {
    let link = window.document.createElement("a");
    link.setAttribute("href", res);
    link.setAttribute("download", res.name);
    link.click();
  }

  /**
   * 改變搜尋的關鍵字
   */
  onKeywordChange(): void {
    if (isDevMode()) {
      window.history.replaceState('list-page', document.title, `/#/list/${this.keyword}`);
    } else {
      window.history.replaceState('list-page', document.title, `/sound-manage/#/list/${this.keyword}`);
    }
    this.filterSound();
  }

  /**
   * 篩選音效檔案
   */
  filterSound(): void{
    this.filtedSoundList = this.soundList.filter(item => {
      if (item.name.toUpperCase().indexOf(this.keyword.toUpperCase()) > -1 || this.hasTag(item.tagsClouds, this.keyword)) {
        return true
      } else {
        return false;
      }
    });
  }

  /**
   * 關鍵字篩選，判斷標籤內有符合的項目
   * @param tags 音效檔案所有標籤
   * @param keyword 關鍵字
   */
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

  /**
   * 取得過去所有標籤列表
   */
  fetchTagsList(): void {
    this.service.fetchTags().subscribe(res => {
      if (res) {
        this.tagList = res.map(item => item.name);
      } else {
        this.tagList = [];
      }
    });
  }

  /**
   * auto complete 元件的篩選標籤
   */
  filterTag(event): void {
    const keyword = event.query.toUpperCase();
    this.filtedTagList = this.tagList.filter(item => {
      const index = item.toUpperCase().indexOf(keyword);
      return index > -1 ? true : false;
    });
  }

  /**
   * 點擊更新音波圖
   * @param event 事件
   * @param sound 音效檔案物件
   */
  updateVoiceGraph(event: any, sound: Sound): void {
    this.service.fetchDownloadLink(sound.id).subscribe(res => {
      sound.wave = WaveSurfer.create({
        container: '#w' + sound.id,
        waveColor: 'violet',
        progressColor: 'purple'
      });

      sound.wave.on('ready', () => {
        const waveElement = document.body.querySelector('#w' + sound.id);
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

  /**
   * 通過 angular url 安全檢查
   * @param resource url
   */
  safeResource(resource: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(resource);
  }

  /**
   * 點擊播放
   */
  play(event: any, sound: Sound): void {
    this.service.fetchDownloadLink(sound.url).subscribe(res => {
      const waveElement = document.body.querySelector('#w' + sound.id);
      waveElement.innerHTML = '';

      sound.wave = WaveSurfer.create({
        container: '#w' + sound.id,
        waveColor: 'violet',
        progressColor: 'purple'
      });

      sound.wave.on('ready', () => {
        sound.wave.play();
        sound.isPause = false;
        sound.isFinish = false;

        if (!sound.graph || sound.graph === 'null') {
          setTimeout(() => {
            const waveElement = document.body.querySelector('#w' + sound.id);
            const canvas = waveElement.querySelectorAll('canvas')[0];
            if (canvas.getContext) {
              var image = canvas.toDataURL("image/png");
              sound.graph = image;
              sound.wave = null
              this.service.updateSound(sound).subscribe(res2 => {
                console.log(res2);
              }, error => {
                console.log(error, sound)
              });
            }
          }, 300);
        }
      });

      sound.wave.on('finish', () => {
        this.zone.run(() => {
          sound.isFinish = true;
        });
      });

      sound.wave.load(res);
    });
  }

  /**
   * 暫停播放
   */
  pause(event: any, sound: Sound): void {
    sound.wave.pause();
    sound.isPause = true;
  }

  /**
   * 暫停後播放
   */
  playPause(event: any, sound: Sound): void {
    sound.wave.playPause();
    sound.isPause = false;
  }

  /**
   * 重新播放
   */
  playAgain(event: any, sound: Sound): void {
    sound.wave.play();
    sound.isPause = false;
    sound.isFinish = false;
  }

  /**
   * 更新所有音波圖
   */
  async updateAllGraph(): Promise<void> {
    const remSounds = this.soundList.filter(sound => !sound.graph || sound.graph === 'null');
    for (let i = 0; i < remSounds.length; i++) {
      const sound = remSounds[i];
      try {
        await this.uploadGraphBatch(sound);
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * 批次更新音波圖
   */
  uploadGraphBatch(sound: Sound): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service.fetchDownloadLink(sound.url).subscribe(res => {
        if (sound.name.indexOf('.wav') === -1 && sound.name.indexOf('.mp3') === -1) {
          console.error(sound.name, 'not type');
          resolve();
          return;
        }
        const target = document.body.querySelector('#waveform');
        target.innerHTML = '';
        const element = window.document.createElement('div');
        element.setAttribute('id', 'ws' + sound.id);
        target.appendChild(element);

        sound.wave = WaveSurfer.create({
          container: '#ws' + sound.id,
          waveColor: 'violet',
          progressColor: 'purple'
        });

        sound.wave.on('ready', () => {
          const waveElement = document.body.querySelector('#ws' + sound.id);
          setTimeout(() => {
            const canvas = waveElement.querySelectorAll('canvas')[0];
            if (canvas.getContext) {
              var image = canvas.toDataURL("image/png");
              sound.graph = image;
              this.service.updateSound(sound).subscribe(res => {
                if (res) {
                  resolve();
                }
              }, error => {
                console.error(error);
                console.info(sound);
                reject();
              });
            }
          }, 300);
        });

        sound.wave.on('error', () => {
          reject(sound.id + ':' + sound.name);
        });

        sound.wave.load(res);
      });
    });
  }
}
