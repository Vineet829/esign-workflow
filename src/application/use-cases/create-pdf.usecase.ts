
import { Injectable, Inject } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { Pdf } from '../../domain/entities/pdf.entity';

@Injectable()
export class CreatePdfUseCase {
  constructor(
    @Inject('PdfRepository') private readonly pdfRepository: PdfRepository,
  ) {}

  async execute(
    content: string,
    uniqueId: string,
    filePath: string,
    tags: string[],
  ): Promise<Pdf> {
   
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    page.drawText(content, {
      x: 50,
      y: 350,
      size: 30,
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes); 

    
    const fullFilePath = `${filePath}/${uniqueId}.pdf`;
    const name = `document-${uniqueId}`; 
    const pdf = new Pdf(uniqueId, fullFilePath, pdfBuffer, tags, name);

    
    await this.pdfRepository.save(pdf);

    return pdf;
  }
}
