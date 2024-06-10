import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { Pdf } from '../../domain/entities/pdf.entity';
export declare class GetPdfUseCase {
    private readonly pdfRepository;
    constructor(pdfRepository: PdfRepository);
    execute(id: string): Promise<Pdf | null>;
}
