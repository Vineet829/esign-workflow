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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const create_pdf_dto_1 = require("../dtos/create-pdf.dto");
const create_pdf_usecase_1 = require("../../application/use-cases/create-pdf.usecase");
const get_pdf_usecase_1 = require("../../application/use-cases/get-pdf.usecase");
const zoho_esign_service_1 = require("../../infrastructure/services/zoho-esign.service");
const uuid_1 = require("uuid");
const pdf_entity_1 = require("../../domain/entities/pdf.entity");
const fs = require("fs");
let PdfController = class PdfController {
    constructor(createPdfUseCase, getPdfUseCase, zohoEsignService) {
        this.createPdfUseCase = createPdfUseCase;
        this.getPdfUseCase = getPdfUseCase;
        this.zohoEsignService = zohoEsignService;
    }
    async create(createPdfDto) {
        if (!createPdfDto.content) {
            throw new common_1.BadRequestException('Content is required');
        }
        const contentBuffer = Buffer.isBuffer(createPdfDto.content)
            ? createPdfDto.content
            : Buffer.from(createPdfDto.content, 'base64');
        try {
            const uniqueId = (0, uuid_1.v4)();
            const result = await this.createPdfUseCase.execute(contentBuffer.toString(), uniqueId, createPdfDto.filePath, createPdfDto.tags);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async get(id, res) {
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', `${id}.pdf`);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.status(common_1.HttpStatus.NOT_FOUND).send('PDF not found');
                return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=${id}.pdf`);
            res.status(common_1.HttpStatus.OK).send(data);
        });
    }
    async previewPdf(id, res) {
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', `${id}.pdf`);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.status(common_1.HttpStatus.NOT_FOUND).send('PDF not found');
                return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline');
            res.status(common_1.HttpStatus.OK).send(data);
        });
    }
    async submit(id, recipientEmail) {
        const filePath = (0, path_1.join)(process.cwd(), 'uploads', `${id}.pdf`);
        try {
            const content = fs.readFileSync(filePath);
            const isPdfValid = validatePdf(content);
            if (!isPdfValid) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid PDF format',
                };
            }
            const response = await this.zohoEsignService.sendForSignature(new pdf_entity_1.Pdf(id, filePath, content, [content.length.toString()], 'application/pdf'), recipientEmail);
            console.log(response);
            return {
                status: common_1.HttpStatus.OK,
                message: 'PDF submitted for signature',
                data: response,
            };
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }
    async uploadPdf(file) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        const filePath = file.path;
        const pdf = new pdf_entity_1.Pdf(file.filename, filePath, file.buffer, [file.size.toString()], 'application/pdf');
        const updatedPdf = await this.zohoEsignService.addEsignTags(pdf);
        return {
            status: common_1.HttpStatus.OK,
            message: 'File uploaded and tags added successfully',
            filePath: updatedPdf.filePath,
        };
    }
};
exports.PdfController = PdfController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_pdf_dto_1.CreatePdfDto]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/preview'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "previewPdf", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('recipientEmail')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "submit", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('pdf', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const fileExtName = (0, path_1.extname)(file.originalname);
                const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtName}`;
                callback(null, fileName);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(pdf)$/)) {
                return callback(new common_1.BadRequestException('Only PDF files are allowed!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PdfController.prototype, "uploadPdf", null);
exports.PdfController = PdfController = __decorate([
    (0, common_1.Controller)('pdf'),
    __metadata("design:paramtypes", [create_pdf_usecase_1.CreatePdfUseCase,
        get_pdf_usecase_1.GetPdfUseCase,
        zoho_esign_service_1.ZohoEsignService])
], PdfController);
function validatePdf(content) {
    const pdfHeader = Buffer.from('%PDF-', 'utf8');
    if (!content || content.length < pdfHeader.length) {
        return false;
    }
    for (let i = 0; i < pdfHeader.length; i++) {
        if (content[i] !== pdfHeader[i]) {
            return false;
        }
    }
    return true;
}
//# sourceMappingURL=pdf.controller.js.map