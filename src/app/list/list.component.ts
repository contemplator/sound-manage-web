import { Component, OnInit, NgZone, isDevMode, Renderer2 } from '@angular/core';
import { AppService } from '../app.service';
import { Sound } from 'viewmodels/sound';
import * as WaveSurfer from 'wavesurfer.js';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';

class SoundItem extends Sound {
  wave?: any;
  isPause?: boolean;
  isFinish?: boolean;
  constructor() {
    super();
  }
}
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  soundList: SoundItem[] = [];          // 所有音效檔案
  virtualSoundList: SoundItem[] = [];   // 顯示中的項目列表
  firstTimeFetch = true;                // 是否第一次查詢資料
  labelList = [];                       // 標籤列表
  filtedLabelList = [];                 // 篩選後的標籤列表
  keyword = '';                         // 關鍵字
  wavesurfer: any;                      // 產生音波圖的物件
  showLoading = false;                  // 是否顯示讀取中
  rows = 30;                            // 資料一次撈取的筆數
  cols: any[] = [];                     // 表格欄位
  scrollHeight = '300px';
  soundCategoryList: any[] = [];        // 音效分類列表
  filtedSoundCategoryList: any[] = [];  // 篩選後音效分類列表

  constructor(
    private service: AppService,
    private sanitizer: DomSanitizer,
    private zone: NgZone,
    private route: ActivatedRoute,
    private render: Renderer2
  ) {
  }

  ngOnInit() {
    const keyword = this.route.snapshot.paramMap.get('keyword');
    this.keyword = keyword || '';
    this.initCols();
    this.fetchSoundsLoop();
    this.fetchLabelsList();
    this.initTableScrollHeight();
    this.fetchSoundCategoryList();
  }

  initCols(): void {
    this.cols = [
      { field: 'name', header: '檔名', width: 15 },
      // { field: 'modifyDatetime', header: '更新時間', width: 6 },
      { field: 'categories', header: '分類', width: 15 },
      { field: 'labels', header: '標籤', width: 15 },
      { field: 'download', header: '下載', width: 5 },
      { field: 'isPublic', header: '公開', width: 5 },
      { field: 'price', header: '價格', width: 5 },
      { field: 'graph', header: '音源預覽', width: 30 },
    ];
  }

  initTableScrollHeight(): void {
    const windowHeight = window.innerHeight;
    this.scrollHeight = windowHeight - 60 - 1 - 16 - 40 - 25 - 4 + 'px';
  }

  /**
   * 查詢音效
   */
  fetchSoundsLoop(): void {
    this.firstTimeFetch = true;
    this.showLoading = true;
    this.soundList = [];
    this.virtualSoundList = [];
    this.fetchSounds();
  }

  /**
   * 查詢音效，有限制的查詢
   */
  fetchSounds(): void {
    this.service.fetchSounds(this.keyword, this.soundList.length, this.rows).subscribe(res => {

      this.soundList = [...this.soundList, ...res.map(item => (new Sound()).parseFromDatabase(item))];
      if (this.firstTimeFetch === true) {
        this.firstTimeFetch = false;
        this.virtualSoundList = this.soundList.slice(0);
        const element = document.querySelector('.ui-table-scrollable-body');
        setTimeout(() => {
          this.render.setStyle(element, 'max-height', 'unset');
          this.render.setStyle(element, 'height', this.scrollHeight);
        }, 0);
      }

      if (res.length === this.rows) {
        this.fetchSounds();
      } else {
        this.showLoading = false;
      }
      console.log(this.soundList);
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
  onLabelAdd(sound: SoundItem): void {
    const req = Object.assign({}, sound);
    req.wave = null;
    this.service.updateSound(req).subscribe(res => {
      if (!res) {
        console.error(res, req);
      }
    });
  }

  /**
   * 刪除標籤
   * @param event 事件
   * @param sound 要刪除標籤的音效檔案
   */
  onLabelRemove(event: any, sound: Sound): void {
    this.service.deleteLabel(sound.url, event).subscribe(res => {

    });
  }

  /**
   * 點擊下載
   * @param url dropbox 檔案的路徑
   */
  onDownloadClick(url: string): void {
    this.service.fetchDownloadLink(url).subscribe(res => {
      this.downloadFile(res);
    });
  }

  /**
   * 下載檔案
   * @param res api 回傳的結果
   */
  downloadFile(res: any): void {
    const link = window.document.createElement('a');
    link.setAttribute('href', res);
    link.setAttribute('download', res.name);
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
    this.fetchSoundsLoop();
  }

  /**
   * 關鍵字篩選，判斷標籤內有符合的項目
   * @param labels 音效檔案所有標籤
   * @param keyword 關鍵字
   */
  hasLabel(labels: string[], keyword: string): boolean {
    const index = labels.findIndex(item => {
      if (item.toUpperCase().indexOf(keyword.toUpperCase()) > -1) {
        return true;
      } else {
        return false;
      }
    });
    return index > -1 ? true : false;
  }

  /**
   * 取得過去所有標籤列表
   */
  fetchLabelsList(): void {
    this.service.fetchLabels().subscribe(res => {
      if (res) {
        this.labelList = res.map(item => item.name);
      } else {
        this.labelList = [];
      }
    });
  }

  /**
   * auto complete 元件的篩選標籤
   */
  filterLabel(event): void {
    const keyword = event.query.toUpperCase();
    this.filtedLabelList = this.labelList.filter(item => {
      const index = item.toUpperCase().indexOf(keyword);
      return index > -1 ? true : false;
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
  play(event: any, sound: SoundItem): void {
    this.pauseOtherSound();
    this.service.fetchDownloadLink(sound.url).subscribe(res => {
      const waveElement = document.body.querySelector('#w' + sound.id);
      waveElement.innerHTML = '';

      sound.wave = WaveSurfer.create({
        container: '#w' + sound.id,
        waveColor: '#565656',
        progressColor: '#0E0B16',
        height: 80
      });

      sound.wave.on('ready', () => {
        sound.wave.play();
        sound.isPause = false;
        sound.isFinish = false;

        setTimeout(() => {
          // const waveElement = document.body.querySelector('#w' + sound.id);
          const canvas = waveElement.querySelectorAll('canvas')[0];
          if (canvas.getContext) {
            const image = canvas.toDataURL('image/png');
            sound.graph = image;
            this.service.updateSound(sound).subscribe(res2 => {
            }, error => {
              console.error(error, sound);
            });
          }
        }, 300);
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
  pause(event: any, sound: SoundItem): void {
    sound.wave.pause();
    sound.isPause = true;
  }

  /**
   * 暫停後播放
   */
  playPause(event: any, sound: SoundItem): void {
    this.pauseOtherSound();
    sound.wave.playPause();
    sound.isPause = false;
  }

  /**
   * 重新播放
   */
  playAgain(event: any, sound: SoundItem): void {
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
        console.log(sound.url);
      } catch (error) {
        console.error(error);
      }
    }
  }

  /**
   * 批次更新音波圖
   */
  uploadGraphBatch(sound: SoundItem): Promise<void> {
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
          progressColor: 'purple',
          height: 80
        });

        sound.wave.on('ready', () => {
          const waveElement = document.body.querySelector('#ws' + sound.id);
          setTimeout(() => {
            const canvas = waveElement.querySelectorAll('canvas')[0];
            if (canvas.getContext) {
              const image = canvas.toDataURL('image/png');
              sound.graph = image;
              this.service.updateSound(sound).subscribe(updateRes => {
                if (updateRes) {
                  resolve();
                }
              }, error => {
                console.error(error);
                reject();
              });
            }
          }, 300);
        });

        sound.wave.on('error', () => {
          reject(sound.url + ':' + sound.name);
        });

        sound.wave.load(res);
      });
    });
  }

  /**
   * 點擊標籤
   */
  onLabelClick(event: { originalEvent: MouseEvent, value: string }): void {
    this.keyword = event.value;
    this.onKeywordChange();
  }

  /**
   * 表格滾動事件，做讀取的動作
   */
  loadDataOnScroll(event: LazyLoadEvent) {
    if (this.soundList.length >= event.first) {
      if (event.first + event.rows >= this.soundList.length) {
        this.virtualSoundList = this.loadChunk(event.first, this.soundList.length - event.first);
      } else {
        this.virtualSoundList = this.loadChunk(event.first, event.rows);
      }
    }
  }

  /**
   * 擷取部分資料顯示
   */
  loadChunk(index, length): Sound[] {
    const chunk: Sound[] = [];
    for (let i = 0; i < length; i++) {
      chunk[i] = this.soundList[index + i];
    }
    return chunk;
  }

  /**
   * 暫停其他的音效
   */
  pauseOtherSound(): void {
    this.soundList.forEach(item => {
      if (item.wave) {
        item.wave.pause();
        item.isPause = true;
      }
    });
  }

  onPriceBlur(event: FocusEvent, sound: SoundItem): void {
    const req = Object.assign({}, sound);
    req.wave = null;
    this.service.updateSound(req).subscribe();
  }

  onPublicChange(event: { originalEvent: MouseEvent, checked: boolean }, sound: SoundItem): void {
    console.log(event, sound);
    const req = Object.assign({}, sound);
    req.wave = null;
    req.isPublic = event.checked ? 1 : 0;
    this.service.updateSound(req).subscribe();
  }

  fetchSoundCategoryList(): void {
    this.service.fetchSoundCatrgories().subscribe(res => {
      console.log(res);
      this.soundCategoryList = res;
    });
  }

  filterCategory(event): void {
    const keyword = event.query.toUpperCase();
    this.filtedSoundCategoryList = this.soundCategoryList.filter(item => {
      return item.name.toUpperCase().indexOf(keyword) > -1 ||
        item.english_name.toUpperCase().indexOf(keyword) > -1;
    });
  }

  /**
   * 新增標籤
   */
  onSoundCategoryAdd(event: any, sound: SoundItem): void {
    this.service.addSoundCategoryMapping(sound.url, event.id).subscribe(res => {

    });
  }

  /**
   * 刪除分類
   */
  onSoundCategoryDelete(event: any, sound: Sound): void {
    console.log(event);
    this.service.deleteSoundCategoryMapping(sound.url, event.id).subscribe(res => {

    });
  }

  /**
   * 點擊標籤
   */
  onSoundCategoryClick(event: { originalEvent: MouseEvent, value: any }): void {
    this.keyword = event.value.name;
    this.onKeywordChange();
  }
}
