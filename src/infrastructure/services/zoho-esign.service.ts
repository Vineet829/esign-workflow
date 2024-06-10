import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pdf } from '../../domain/entities/pdf.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as FormData from 'form-data';
import { PDFDocument, rgb } from 'pdf-lib';
import axios from 'axios';

@Injectable()
export class ZohoEsignService {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private apiUrl = 'https://sign.zoho.in/api/v1';

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('ZOHO_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('ZOHO_CLIENT_SECRET');
    this.refreshToken = this.configService.get<string>('ZOHO_REFRESH_TOKEN');
  }

  private async getAccessToken(): Promise<string> {
    const url = `https://accounts.zoho.in/oauth/v2/token`;
    const params = new URLSearchParams({
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: 'https%3A%2F%2Fsign.zoho.com',
      grant_type: 'refresh_token',
    });

    try {
      const response = await axios.post(url, params);
      const responseData = response.data as { access_token: string };
      if (!responseData.access_token) {
        throw new HttpException(
          'Failed to retrieve access token',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      console.log(responseData.access_token);
      return responseData.access_token;
    } catch (error) {
      console.error('Error retrieving access token:', error);
      throw new HttpException(
        'Failed to retrieve access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async uploadPdf(file: Express.Multer.File): Promise<Pdf> {
    const filePath = path.join(
      __dirname,
      '../../../uploads',
      file.originalname,
    );
    fs.writeFileSync(filePath, file.buffer);
    const pdf = new Pdf(
      file.originalname,
      filePath,
      file.buffer,
      [file.size.toString()],
      'application/pdf',
    ); 
    return pdf;
  }

  public async addEsignTags(pdf: Pdf): Promise<Pdf> {
    try {
      const existingPdfBytes = fs.readFileSync(pdf.filePath);
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      
      firstPage.drawRectangle({
        x: 50,
        y: 50,
        width: 200,
        height: 50,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
      firstPage.drawText('E-Sign Here', {
        x: 60,
        y: 70,
        size: 12,
        color: rgb(0, 0, 0),
      });

    
      const radioYOffset = 120;
      const radioXOffset = 50;
      const radioYGap = 30;

      
      firstPage.drawText('Option 1:', {
        x: radioXOffset + 20,
        y: radioYOffset + height - 720,
        size: 12,
        color: rgb(0, 0, 0),
      });
      firstPage.drawEllipse({
        x: radioXOffset + 7.5,
        y: radioYOffset + height - 717.5,
        xScale: 7.5,
        yScale: 7.5,
        color: rgb(1, 1, 1), 
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      firstPage.drawText('Option 2:', {
        x: radioXOffset + 20,
        y: radioYOffset + height - (720 + radioYGap),
        size: 12,
        color: rgb(0, 0, 0),
      });
      firstPage.drawEllipse({
        x: radioXOffset + 7.5,
        y: radioYOffset + height - (717.5 + radioYGap),
        xScale: 7.5,
        yScale: 7.5,
        color: rgb(1, 1, 1), 
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });

      
      const pdfBytes = await pdfDoc.save();
      fs.writeFileSync(pdf.filePath, pdfBytes);

      return pdf;
    } catch (error) {
      console.error('Error adding eSign tags to PDF:', error);
      throw new HttpException(
        'Failed to add eSign tags to PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async previewPdf(pdf: Pdf): Promise<string> {
    
    return pdf.filePath;
  }

  public async sendForSignature(
    pdf: Pdf,
    recipientEmail: string,
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const url = `${this.apiUrl}/requests`;
    const headers = {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
    };

    const actionsJson = {
      recipient_name: 'Recipient Name',
      recipient_email: recipientEmail,
      action_type: 'SIGN',
      private_notes: 'Please sign the document',
      signing_order: 0,
      verify_recipient: true,
      verification_type: 'EMAIL',
    };

    const documentJson = {
      request_name: 'Sample Document',
      expiration_days: 1,
      is_sequential: true,
      email_reminders: true,
      reminder_period: 8,
      actions: [actionsJson],
    };

    const data = {
      requests: documentJson,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('file', fs.createReadStream(pdf.filePath));

    try {
      const response = await axios.post(url, formData, {
        headers: {
          ...headers,
          ...formData.getHeaders(),
        },
      });

      
      console.log('Zoho API Response:', response.data);

      
      const responseData = response.data as {
        requests: {
          request_id: string;
          actions: Array<{
            action_id: string;
            recipient_name: string;
            recipient_email: string;
            action_type: string;
          }>;
          document_ids: Array<{ document_id: string }>;
        };
      };

      return responseData;
    } catch (error) {
      
      console.error('Error sending document for e-signature:', error);
      if (axios.isAxiosError(error)) {
        console.error('Zoho API Response:', error.response?.data);
        const status =
          error.response?.status === 400
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const message =
          error.response?.data?.message || error.message || 'Unknown error';
        throw new HttpException(
          `Failed to send document for e-signature: ${message}`,
          status,
        );
      }
      throw new HttpException(
        'Failed to send document for e-signature',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
