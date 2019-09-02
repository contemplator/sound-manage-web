import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sound } from 'viewmodels/sound';
import { Tag } from 'viewmodels/tag';
import { FolderNode } from 'viewmodels/folder-node';
import { SoundCatrgory, AddSoundCatrgoryReq } from 'sound-manage-server/dist/models/sound';

@Injectable()
export class AppService {
  host = 'http://45.76.213.205/sound-manage-server/';

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
   * @param offset 起始
   * @param limit 筆數
   */
  fetchSounds(keyword: string, offset: number = 0, limit: number = 30): Observable<Sound[]> {
    const data = {
      keyword: keyword,
      offset: offset,
      limit: limit
    };
    return this.httpClient.post<Sound[]>(`${this.host}sound/fetchSounds`, data);
  }

  /**
   * 更新音效資訊
   * @param sound 音效物件
   */
  updateSound(sound: Sound): Observable<Sound> {
    if (sound.labelClouds) {
      sound.labels = sound.labelClouds.length > 0 ? sound.labelClouds.join(',') : '';
    }
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
   * @param url 資料庫內音效的 url
   * @param label 標籤
   */
  deleteLabel(url: string, label: string): Observable<boolean> {
    const data = {
      url: url,
      label: label
    };
    return this.httpClient.post<boolean>(`${this.host}sound/deleteLabel`, data);
  }

  /**
   * 抓取所有標籤
   */
  fetchLabels(): Observable<Tag[]> {
    return this.httpClient.get<Tag[]>(`${this.host}sound/fetchLabels`);
  }

  /**
   * 上傳檔案
   * @param formData 檔案及表單內容
   */
  uploadFiles(formData): Observable<any> {
    return this.httpClient.post(`${this.host}sound/uploadFile`, formData);
  }

  /**
   * 取得資料夾結構
   */
  fetchFolders(): Observable<FolderNode> {
    return this.httpClient.get<FolderNode>(`${this.host}sound/fetchFolders`);
  }

  /**
   * 取得音效分類列表
   */
  fetchSoundCatrgories(): Observable<SoundCatrgory[]> {
    return this.httpClient.get<SoundCatrgory[]>(`${this.host}sound/fetchSoundCategories`);
  }

  /**
   * 增加音效分類
   */
  addSoundCategory(req: AddSoundCatrgoryReq): Observable<boolean> {
    return this.httpClient.post<boolean>(this.host + 'sound/addSoundCategory', req);
  }

  /**
   * 為音效匹配分類
   */
  addSoundCategoryMapping(sound_url: string, category_id: number): Observable<boolean> {
    const req = {
      sound_url: sound_url,
      category_id: category_id
    };
    console.log(req);
    return this.httpClient.post<boolean>(this.host + 'sound/addSoundCategoryMapping', req);
  }

  /**
   * 為音效刪除匹配分類
   */
  deleteSoundCategoryMapping(sound_url: string, category_id: number): Observable<boolean> {
    const req = {
      sound_url: sound_url,
      category_id: category_id
    };
    return this.httpClient.post<boolean>(this.host + 'sound/deleteSoundCategoryMapping', req);
  }
}
