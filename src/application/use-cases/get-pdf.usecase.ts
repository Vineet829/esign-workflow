
import { Injectable, Inject } from '@nestjs/common';
import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { Pdf } from '../../domain/entities/pdf.entity';

@Injectable()
export class GetPdfUseCase {
  constructor(
    @Inject('PdfRepository') private readonly pdfRepository: PdfRepository,
  ) {}

  async execute(id: string): Promise<Pdf | null> {
    return this.pdfRepository.findById(id);
  }
}
