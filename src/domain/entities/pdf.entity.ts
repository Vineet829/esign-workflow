
export class Pdf {
  constructor(
    public id: string,
    public filePath: string,
    public content: Buffer,
    public tags: string[],
    public name: string, 
  ) {}
}
