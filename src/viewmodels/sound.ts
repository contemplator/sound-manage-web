export class Sound {
  id: string;
  name: string;
  url: string;
  modifyDatetime: Date;
  tags: string;
  tagsClouds: string[];
  graph: any;

  constructor() {
    this.id = '';
    this.name = '';
    this.url = '';
    this.modifyDatetime = new Date();
    this.tags = '';
    this.tagsClouds = [];
    this.graph = null;
  }

  parseFromDropbox(json: any) {
    // console.log(json);
    this.id = json.id.slice(3);
    this.name = json.name;
    this.url = json.path_display;
    this.modifyDatetime = new Date(json.server_modified);
    this.tags = '';
    this.tagsClouds = [];
    this.graph = null;
    return this;
  }

  parseFromDatabase(json: any) {
    console.log(json);
    this.id = json.soundId;
    this.name = json.name;
    this.url = json.url;
    this.modifyDatetime = new Date(json.modifyDatetime);
    this.tags = json.tags;
    this.tagsClouds = this.tags.split(',');
    this.graph = null;
    return this;
  }
}
