import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Sound } from 'viewmodels/sound';

@Injectable()
export class AppService {
  host = '../sound-manage-serve/';

  constructor(
    private httpClient: HttpClient
  ) {
    if (isDevMode()) {
      this.host = 'http://localhost:3000/';
    }
  }

  fetchDropboxFolder(): Observable<Sound[]> {
    return this.httpClient.get<Sound[]>(`${this.host}dropbox/list/素材管理`);
  }

  fetchDbSounds(): Observable<Sound[]> {
    return this.httpClient.get<Sound[]>(`${this.host}sound/query`);
  }

  updateSound(sound: Sound): Observable<Sound> {
    sound.tags = sound.tagsClouds.join(',');
    return this.httpClient.post<Sound>(`${this.host}sound/set`, sound);
  }
}
