"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZohoEsignService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pdf_entity_1 = require("../../domain/entities/pdf.entity");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const pdf_lib_1 = require("pdf-lib");
const axios_1 = require("axios");
let ZohoEsignService = class ZohoEsignService {
    constructor(configService) {
        this.configService = configService;
        this.apiUrl = 'https://sign.zoho.in/api/v1';
        this.clientId = this.configService.get('ZOHO_CLIENT_ID');
        this.clientSecret = this.configService.get('ZOHO_CLIENT_SECRET');
        this.refreshToken = this.configService.get('ZOHO_REFRESH_TOKEN');
    }
    async getAccessToken() {
        const url = `https://accounts.zoho.in/oauth/v2/token`;
        const params = new URLSearchParams({
            refresh_token: this.refreshToken,
            client_id: this.clientId,
            client_secret: this.clientSecret,
            redirect_uri: 'https%3A%2F%2Fsign.zoho.com',
            grant_type: 'refresh_token',
        });
        try {
            const response = await axios_1.default.post(url, params);
            const responseData = response.data;
            if (!responseData.access_token) {
                throw new common_1.HttpException('Failed to retrieve access token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            console.log(responseData.access_token);
            return responseData.access_token;
        }
        catch (error) {
            console.error('Error retrieving access token:', error);
            throw new common_1.HttpException('Failed to retrieve access token', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadPdf(file) {
        const filePath = path.join(__dirname, '../../../uploads', file.originalname);
        fs.writeFileSync(filePath, file.buffer);
        const pdf = new pdf_entity_1.Pdf(file.originalname, filePath, file.buffer, [file.size.toString()], 'application/pdf');
        return pdf;
    }
    async addEsignTags(pdf) {
        try {
            const existingPdfBytes = fs.readFileSync(pdf.filePath);
            const pdfDoc = await pdf_lib_1.PDFDocument.load(existingPdfBytes);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { height } = firstPage.getSize();
            firstPage.drawRectangle({
                x: 50,
                y: 50,
                width: 200,
                height: 50,
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1,
            });
            firstPage.drawText('E-Sign Here', {
                x: 60,
                y: 70,
                size: 12,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
            const radioYOffset = 120;
            const radioXOffset = 50;
            const radioYGap = 30;
            firstPage.drawText('Option 1:', {
                x: radioXOffset + 20,
                y: radioYOffset + height - 720,
                size: 12,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
            firstPage.drawEllipse({
                x: radioXOffset + 7.5,
                y: radioYOffset + height - 717.5,
                xScale: 7.5,
                yScale: 7.5,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1,
            });
            firstPage.drawText('Option 2:', {
                x: radioXOffset + 20,
                y: radioYOffset + height - (720 + radioYGap),
                size: 12,
                color: (0, pdf_lib_1.rgb)(0, 0, 0),
            });
            firstPage.drawEllipse({
                x: radioXOffset + 7.5,
                y: radioYOffset + height - (717.5 + radioYGap),
                xScale: 7.5,
                yScale: 7.5,
                color: (0, pdf_lib_1.rgb)(1, 1, 1),
                borderColor: (0, pdf_lib_1.rgb)(0, 0, 0),
                borderWidth: 1,
            });
            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(pdf.filePath, pdfBytes);
            return pdf;
        }
        catch (error) {
            console.error('Error adding eSign tags to PDF:', error);
            throw new common_1.HttpException('Failed to add eSign tags to PDF', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async previewPdf(pdf) {
        return pdf.filePath;
    }
    async sendForSignature(pdf, recipientEmail) {
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
            const response = await axios_1.default.post(url, formData, {
                headers: {
                    ...headers,
                    ...formData.getHeaders(),
                },
            });
            console.log('Zoho API Response:', response.data);
            const responseData = response.data;
            return responseData;
        }
        catch (error) {
            console.error('Error sending document for e-signature:', error);
            if (axios_1.default.isAxiosError(error)) {
                console.error('Zoho API Response:', error.response?.data);
                const status = error.response?.status === 400
                    ? common_1.HttpStatus.BAD_REQUEST
                    : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
                const message = error.response?.data?.message || error.message || 'Unknown error';
                throw new common_1.HttpException(`Failed to send document for e-signature: ${message}`, status);
            }
            throw new common_1.HttpException('Failed to send document for e-signature', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ZohoEsignService = ZohoEsignService;
exports.ZohoEsignService = ZohoEsignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ZohoEsignService);
//# sourceMappingURL=zoho-esign.service.js.map