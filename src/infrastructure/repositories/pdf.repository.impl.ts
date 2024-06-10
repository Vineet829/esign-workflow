import { Injectable } from '@nestjs/common';
import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { Pdf } from '../../domain/entities/pdf.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfRepositoryImpl implements PdfRepository {
  private readonly storagePath = path.join(process.cwd(), 'uploads');

  async save(pdf: Pdf): Promise<void> {
    const filePath = path.join(this.storagePath, `${pdf.id}.pdf`);

    
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }

    fs.writeFileSync(filePath, pdf.content);

  
    const metadataPath = path.join(this.storagePath, `${pdf.id}.json`);
    const metadata = {
      id: pdf.id,
      filePath: filePath, 
      tags: pdf.tags,
      name: pdf.name,
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
  }

  async findById(id: string): Promise<Pdf | null> {
    const filePath = path.join(this.storagePath, `${id}.pdf`);
    const metadataPath = path.join(this.storagePath, `${id}.json`);

    if (!fs.existsSync(filePath) || !fs.existsSync(metadataPath)) {
      return null;
    }

    const content = fs.readFileSync(filePath);
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    const pdf = new Pdf(
      metadata.id,
      metadata.filePath,
      content,
      metadata.tags,
      metadata.name,
    );
    return pdf;
  }

  async generatePdf(
    content: string,
    id: string,
    filePath: string,
    tags: string[],
    name: string,
  ): Promise<Pdf> {
    const pdf = new Pdf(
      id,
      filePath,
      Buffer.from(content, 'base64'),
      tags,
      name,
    );
    await this.save(pdf);
    return pdf;
  }
}
