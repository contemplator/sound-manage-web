import { Component, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  constructor(
    private service: AppService
  ) { }

  ngOnInit() {
  }

  myUploader(event): void {
    const files = event.files;
    const formData: FormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      console.log(files[i]['name']);
      formData.append("files", files[i], files[i]['name']);
    }
    this.service.uploadFiles(formData).subscribe(res => {
      console.log(res);
    });
    // const files: Array<File> = this.filesToUpload;
  }

}
