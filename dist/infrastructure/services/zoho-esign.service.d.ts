/// <reference types="multer" />
import { ConfigService } from '@nestjs/config';
import { Pdf } from '../../domain/entities/pdf.entity';
export declare class ZohoEsignService {
    private readonly configService;
    private clientId;
    private clientSecret;
    private refreshToken;
    private apiUrl;
    constructor(configService: ConfigService);
    private getAccessToken;
    uploadPdf(file: Express.Multer.File): Promise<Pdf>;
    addEsignTags(pdf: Pdf): Promise<Pdf>;
    previewPdf(pdf: Pdf): Promise<string>;
    sendForSignature(pdf: Pdf, recipientEmail: string): Promise<any>;
}
