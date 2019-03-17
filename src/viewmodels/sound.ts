export class Sound {
  id: string;
  name: string;
  url: string;
  modifyDatetime: Date;
  labels: string;
  labelClouds: string[];
  graph: any;
  price: number;
  isPublic: number;

  constructor() {
    this.id = '';
    this.name = '';
    this.url = '';
    this.modifyDatetime = new Date();
    this.labels = '';
    this.labelClouds = [];
    this.graph = null;
  }

  parseFromDropbox(json: any) {
    this.id = json.id.slice(3);
    this.name = json.name;
    this.url = json.path_display;
    this.modifyDatetime = new Date(json.server_modified);
    this.labels = '';
    this.labelClouds = [];
    this.graph = null;
    return this;
  }

  parseFromDatabase(json: any) {
    this.id = json.soundId;
    this.name = json.name;
    this.url = json.url;
    this.modifyDatetime = new Date(json.modifyDatetime);
    this.labels = json.labels ? json.labels : '';
    this.labelClouds = this.labels.length > 0 ? this.labels.split(','): [];
    this.graph = json.graph;
    this.price = json.price;
    this.isPublic = json.isPublic;
    return this;
  }
}
