import { Component, OnInit, NgZone, isDevMode, Renderer2 } from '@angular/core';
import { AppService } from '../app.service';
import { Sound } from 'viewmodels/sound';
import * as WaveSurfer from 'wavesurfer.js';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LazyLoadEvent } from 'primeng/primeng';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  soundList: Sound[] = [];          // 所有音效檔案
  virtualSoundList: Sound[] = [];                   // 顯示中的項目列表
  inmemoryData: Sound[] = [];
  labelList = [];                     // 標籤列表
  filtedLabelList = [];               // 篩選後的標籤列表
  keyword = '';                     // 關鍵字
  wavesurfer: any;                  // 產生音波圖的物件
  showLoading = false;              // 是否顯示讀取中
  rows = 30;                        // 資料一次撈取的筆數
  cols: any[] = [];                 // 表格欄位
  scrollHeight = '300px';

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
  }

  initCols(): void {
    this.cols = [
      { field: 'name', header: '檔名', width: 15 },
      { field: 'modifyDatetime', header: '更新時間', width: 6 },
      { field: 'labels', header: '標籤', width: 15 },
      { field: 'download', header: '下載', width: 5 },
      { field: 'graph', header: '音源預覽', width: 30 },
    ]
  }

  initTableScrollHeight(): void {
    const windowHeight = window.innerHeight;
    this.scrollHeight = windowHeight - 60 - 1 - 16 - 40 - 25 - 4 + 'px';
  }

  /**
   * 查詢音效
   */
  fetchSoundsLoop(): void {
    this.showLoading = true;
    this.soundList = [];
    this.virtualSoundList = [];
    this.inmemoryData = [];
    this.fetchSounds();
  }

  /**
   * 查詢音效，有限制的查詢
   */
  fetchSounds(): void {
    this.service.fetchSounds(this.keyword, this.soundList.length, this.rows).subscribe(res => {
      this.soundList = [...this.soundList, ...res.map(item => (new Sound()).parseFromDatabase(item))];
      if (this.inmemoryData.length === 0) {
        this.inmemoryData = this.soundList.slice(0);
        this.virtualSoundList = this.inmemoryData;
        this.loadDataOnScroll({ first: 0, rows: this.rows });
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
  onLabelAdd(sound: Sound): void {
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
  onLabelRemove(event: any, sound: Sound): void {
    this.service.deleteLabel(sound.url, event).subscribe(res => {
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
    this.fetchSoundsLoop();
    // this.filterSound();
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
    })
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
  play(event: any, sound: Sound): void {
    this.pauseOtherSound();
    this.service.fetchDownloadLink(sound.url).subscribe(res => {
      const waveElement = document.body.querySelector('#w' + sound.id);
      waveElement.innerHTML = '';

      sound.wave = WaveSurfer.create({
        container: '#w' + sound.id,
        waveColor: 'violet',
        progressColor: 'purple',
        height: 80
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
                // console.log(res2);
              }, error => {
                console.error(error, sound)
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
    this.pauseOtherSound();
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
        console.log(sound.url);
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
          progressColor: 'purple',
          height: 80
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
    let chunk: Sound[] = [];
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

  /**
   * 點擊更新音波圖
   * @param event 事件
   * @param sound 音效檔案物件
   */
  updateVoiceGraph(event: any, sound: Sound): void {
    this.service.fetchDownloadLink(sound.url).subscribe(res => {
      sound.wave = WaveSurfer.create({
        container: '#w' + sound.id,
        waveColor: 'violet',
        progressColor: 'purple',
        height: 80
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
}
