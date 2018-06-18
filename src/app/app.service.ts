import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Sound } from 'viewmodels/sound';
import { Tag } from 'viewmodels/tag';

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
    sound.tags = sound.tagsClouds.length > 0 ? sound.tagsClouds.join(','): '';
    return this.httpClient.post<Sound>(`${this.host}sound/set`, sound);
  }

  fetchDownloadLink(url: string): Observable<any>{
    const data = {
      url: url
    };
    return this.httpClient.post<any>(`${this.host}dropbox/fetchDownloadLink`, data);
  }

  deleteTag(soundId: string, tag: string): Observable<boolean>{
    const data = {
      soundId: soundId,
      tag: tag
    };
    return this.httpClient.post<boolean>(`${this.host}sound/deleteTag`, data);
  }

  fetchTags(): Observable<Tag[]>{
    return this.httpClient.get<Tag[]>(`${this.host}sound/fetchTags`);
  }
}
