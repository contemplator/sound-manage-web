import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';
import { MessageService } from 'primeng/primeng';
import * as WaveSurfer from 'wavesurfer.js';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  constructor(
    private service: AppService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
  }

  myUploader(event): void {
    const files = event.files;
    const formData: FormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i], files[i]['name']);
    }

    this.service.uploadFiles(formData).subscribe(res => {
      this.updateGraph(res);
    });
  }

  updateGraph(data: any): void {
    data.forEach(sound => {
      this.service.fetchDownloadLink(sound.id).subscribe(res => {
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
              var image = canvas.toDataURL("image/png");
              sound.graph = image;
              this.service.updateSound(sound).subscribe(res => {
                waveElement.innerHTML = '';
                this.messageService.add({ severity: 'success', summary: 'Success Message', detail: '已上傳至 Dropbox 並更新音波圖' });
              });
            }
          }, 300);

        });

        sound.wave.load(res);
      });
    });
  }

}
