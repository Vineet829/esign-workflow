/// <reference types="multer" />
import { CreatePdfDto } from '../dtos/create-pdf.dto';
import { CreatePdfUseCase } from '../../application/use-cases/create-pdf.usecase';
import { GetPdfUseCase } from '../../application/use-cases/get-pdf.usecase';
import { ZohoEsignService } from '../../infrastructure/services/zoho-esign.service';
import { Response } from 'express';
export declare class PdfController {
    private readonly createPdfUseCase;
    private readonly getPdfUseCase;
    private readonly zohoEsignService;
    constructor(createPdfUseCase: CreatePdfUseCase, getPdfUseCase: GetPdfUseCase, zohoEsignService: ZohoEsignService);
    create(createPdfDto: CreatePdfDto): Promise<any>;
    get(id: string, res: Response): Promise<void>;
    previewPdf(id: string, res: Response): Promise<void>;
    submit(id: string, recipientEmail: string): Promise<any>;
    uploadPdf(file: Express.Multer.File): Promise<any>;
}
