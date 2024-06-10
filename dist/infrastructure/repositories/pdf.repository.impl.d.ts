import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { Pdf } from '../../domain/entities/pdf.entity';
export declare class PdfRepositoryImpl implements PdfRepository {
    private readonly storagePath;
    save(pdf: Pdf): Promise<void>;
    findById(id: string): Promise<Pdf | null>;
    generatePdf(content: string, id: string, filePath: string, tags: string[], name: string): Promise<Pdf>;
}
