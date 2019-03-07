import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sound } from 'viewmodels/sound';
import { Tag } from 'viewmodels/tag';
import { FolderNode } from 'viewmodels/folder-node';

@Injectable()
export class AppService {
  host = 'http://66.42.58.237/sound-manage-server/';

  constructor(
    private httpClient: HttpClient
  ) {
    if (isDevMode()) {
      this.host = 'sound-manage-server/';
    }
  }

  /**
   * 停用
   */
  fetchDropboxFolder(folder: string): Observable<Sound[]> {
    return this.httpClient.get<Sound[]>(`${this.host}dropbox/listAll/${folder}`);
  }

  /**
   * 取得所有音效
   */
  fetchAllSounds(): Observable<Sound[]> {
    return this.httpClient.get<Sound[]>(`${this.host}sound/query`);
  }

  /**
   * 關鍵字查詢音效
   * @param keyword 關鍵字
   */
  fetchSounds(keyword: string): Observable<Sound[]> {
    const data = {
      keyword: keyword
    };
    return this.httpClient.post<Sound[]>(`${this.host}sound/fetchSounds`, data);
  }

  /**
   * 更新音效資訊
   * @param sound 音效物件 
   */
  updateSound(sound: Sound): Observable<Sound> {
    if(sound.tagsClouds){
      sound.tags = sound.tagsClouds.length > 0 ? sound.tagsClouds.join(',') : '';
    }
    sound.wave = null;
    return this.httpClient.post<Sound>(`${this.host}sound/set`, sound);
  }

  /**
   * 取得暫時的下載連結
   * @param url dropbox 檔案路徑
   */
  fetchDownloadLink(url: string): Observable<any> {
    const data = {
      url: url
    };
    return this.httpClient.post<any>(`${this.host}dropbox/fetchDownloadLink`, data);
  }

  /**
   * 刪除檔案標籤
   * @param soundId 資料庫內音效的 id 
   * @param tag 標籤
   */
  deleteTag(soundId: string, tag: string): Observable<boolean> {
    const data = {
      soundId: soundId,
      tag: tag
    };
    return this.httpClient.post<boolean>(`${this.host}sound/deleteTag`, data);
  }

  /**
   * 抓取所有標籤
   */
  fetchTags(): Observable<Tag[]> {
    return this.httpClient.get<Tag[]>(`${this.host}sound/fetchTags`);
  }

  /**
   * 上傳檔案
   * @param formData 檔案及表單內容
   */
  uploadFiles(formData): Observable<any> {
    return this.httpClient.post('http://localhost:3000/sound-manage-server/sound/uploadFile', formData);
  }

  /**
   * 取得資料夾結構
   */
  fetchFolders(): Observable<FolderNode>{
    return this.httpClient.get<FolderNode>(`${this.host}sound/fetchFolders`);
  }
}
