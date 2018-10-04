export class FolderNode {
  id: number;
  name: string;
  level: number;
  children: FolderNode[];
  parent?: FolderNode;

  constructor(id: number, name: string, level: number) {
    this.id = id;
    this.name = name;
    this.level = level;
    this.children = [];
  }
}
