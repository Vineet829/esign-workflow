import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { Pdf } from '../../domain/entities/pdf.entity';
export declare class CreatePdfUseCase {
    private readonly pdfRepository;
    constructor(pdfRepository: PdfRepository);
    execute(content: string, uniqueId: string, filePath: string, tags: string[]): Promise<Pdf>;
}
