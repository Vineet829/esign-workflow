import { Pdf } from '../entities/pdf.entity';

export interface PdfRepository {
  save(pdf: Pdf): Promise<void>;
  findById(id: string): Promise<Pdf | null>;
  generatePdf(
    content: string,
    id: string,
    filePath: string,
    tags: string[],
    name: string,
  ): Promise<Pdf>;
}
