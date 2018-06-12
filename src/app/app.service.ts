import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Sound } from 'viewmodels/sound';

@Injectable()
export class AppService {
  host = '../sound-manage-server/';

  constructor(
    private httpClient: HttpClient
  ) {
    if (isDevMode()) {
      this.host = '/sound-manage-server/';
    }
  }

  fetchDropboxFolder(folder: string): Observable<Sound[]> {
    return this.httpClient.get<Sound[]>(`${this.host}dropbox/listAll/${folder}`);
  }

  fetchDbSounds(): Observable<Sound[]> {
    return this.httpClient.get<Sound[]>(`${this.host}sound/query`);
  }

  updateSound(sound: Sound): Observable<Sound> {
    sound.tags = sound.tagsClouds.join(',');
    return this.httpClient.post<Sound>(`${this.host}sound/set`, sound);
  }
}
