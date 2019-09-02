import { Component, OnInit, NgZone } from '@angular/core';
import { AppService } from '../app.service';
import { MessageService } from 'primeng/primeng';
import * as WaveSurfer from 'wavesurfer.js';
import { FolderNode } from 'viewmodels/folder-node';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  curFolderDir: FolderNode[] = []; // 目前的所選資料夾的路徑
  folders: FolderNode[][] = [];   // 目前顯示的各個 level 下資料夾

  constructor(
    private service: AppService,
    private messageService: MessageService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.fetchFolders();
  }

  /**
   * 上傳檔案
   * @param event
   */
  myUploader(event): void {
    const files = event.files;
    const formData: FormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i]['name']);
    }

    formData.set('dir', this.getCurDir());

    this.service.uploadFiles(formData).subscribe(res => {
      this.updateGraph(res);
    });
  }

  /**
   * 更新音波圖
   * @param data
   */
  updateGraph(data: any): void {
    data.forEach(sound => {
      this.service.fetchDownloadLink(sound.url).subscribe(res => {
        const target = document.body.querySelector('#hidden-graph');
        const element = window.document.createElement('div');
        element.setAttribute('id', 'w' + sound.id);
        target.appendChild(element);

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
              const image = canvas.toDataURL('image/png');
              sound.graph = image;
              sound.price = 0;
              sound.is_public = 0;
              sound.isPublic = 0;
              this.service.updateSound(sound).subscribe(() => {
                waveElement.innerHTML = '';
                this.zone.run(() => {
                  this.messageService.add({ severity: 'success', summary: 'Success Message', detail: '已上傳至 Dropbox 並更新音波圖' });
                });
              });
            }
          }, 300);

        });

        sound.wave.load(res);
      });
    });
  }

  /**
   * 取得資料夾結構
   */
  fetchFolders(): void {
    this.service.fetchFolders().subscribe(res => {
      let curNode = res;
      while (curNode.level < 2) {
        this.curFolderDir.push(curNode);
        if (curNode.level === 1) {
          this.folders.push(curNode.children);
        }
        curNode = curNode.children[0];
      }
    });
  }

  /**
   * 取得目前上傳檔案的路徑
   */
  getCurDir(): string {
    return this.curFolderDir.map(item => item.name).join('/') + '/';
  }

  /**
   * 點擊某個資料節節點
   * @param event 點擊事件
   */
  onFolderClick(event): void {
    const node = event.value;
    const dirLevel = this.curFolderDir.length - 1;
    const nodeLevel = node.level;
    if (node.level <= dirLevel) {
      let diffLevel = dirLevel - nodeLevel;
      while (diffLevel >= 0) {
        this.curFolderDir.pop();
        this.folders.pop();
        diffLevel -= 1;
      }
    }

    this.curFolderDir.push(node);
    if (node.children.length > 0) {
      this.folders.push(node.children);
    } else {
      const emptyNode = new FolderNode(0, '無子資料夾', nodeLevel + 1);
      this.folders.push([emptyNode]);
    }
  }

}
