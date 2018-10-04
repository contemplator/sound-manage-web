import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Sound } from 'viewmodels/sound';
import { Tag } from 'viewmodels/tag';
import { FolderNode } from 'viewmodels/folder-node';

@Injectable()
export class AppService {
  host = '../sound-manage-server/';

  constructor(
    private httpClient: HttpClient
  ) {
    if (isDevMode()) {
      this.host = 'http://localhost:3000/sound-manage-server/';
    }
  }

  fetchDropboxFolder(folder: string): Observable<Sound[]> {
    return this.httpClient.get<Sound[]>(`${this.host}dropbox/listAll/${folder}`);
  }

  fetchDbSounds(): Observable<Sound[]> {
    return this.httpClient.get<Sound[]>(`${this.host}sound/query`);
  }

  updateSound(sound: Sound): Observable<Sound> {
    if(sound.tagsClouds){
      sound.tags = sound.tagsClouds.length > 0 ? sound.tagsClouds.join(',') : '';
    }
    sound.wave = null;
    return this.httpClient.post<Sound>(`${this.host}sound/set`, sound);
  }

  fetchDownloadLink(id: string): Observable<any> {
    const data = {
      url: 'id:' + id
    };
    return this.httpClient.post<any>(`${this.host}dropbox/fetchDownloadLink`, data);
  }

  deleteTag(soundId: string, tag: string): Observable<boolean> {
    const data = {
      soundId: soundId,
      tag: tag
    };
    return this.httpClient.post<boolean>(`${this.host}sound/deleteTag`, data);
  }

  fetchTags(): Observable<Tag[]> {
    return this.httpClient.get<Tag[]>(`${this.host}sound/fetchTags`);
  }

  uploadFiles(formData): Observable<any> {
    return this.httpClient.post('http://localhost:3000/sound-manage-server/sound/uploadFile', formData);
  }

  fetchFolders(): Observable<FolderNode>{
    return this.httpClient.get<FolderNode>(`${this.host}sound/fetchFolders`);
  }
}
