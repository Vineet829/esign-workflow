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
exports.CreatePdfUseCase = void 0;
const common_1 = require("@nestjs/common");
const pdf_lib_1 = require("pdf-lib");
const pdf_entity_1 = require("../../domain/entities/pdf.entity");
let CreatePdfUseCase = class CreatePdfUseCase {
    constructor(pdfRepository) {
        this.pdfRepository = pdfRepository;
    }
    async execute(content, uniqueId, filePath, tags) {
        const pdfDoc = await pdf_lib_1.PDFDocument.create();
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
        const pdf = new pdf_entity_1.Pdf(uniqueId, fullFilePath, pdfBuffer, tags, name);
        await this.pdfRepository.save(pdf);
        return pdf;
    }
};
exports.CreatePdfUseCase = CreatePdfUseCase;
exports.CreatePdfUseCase = CreatePdfUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PdfRepository')),
    __metadata("design:paramtypes", [Object])
], CreatePdfUseCase);
//# sourceMappingURL=create-pdf.usecase.js.map