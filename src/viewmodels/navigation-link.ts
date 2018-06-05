export class NavigationLink {
  label: string;
  url: string;
  active?: boolean;

  constructor(label: string, url: string) {
    this.label = label;
    this.url = url;
  }
}
