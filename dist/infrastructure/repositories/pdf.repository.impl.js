"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfRepositoryImpl = void 0;
const common_1 = require("@nestjs/common");
const pdf_entity_1 = require("../../domain/entities/pdf.entity");
const fs = require("fs");
const path = require("path");
let PdfRepositoryImpl = class PdfRepositoryImpl {
    constructor() {
        this.storagePath = path.join(process.cwd(), 'uploads');
    }
    async save(pdf) {
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
    async findById(id) {
        const filePath = path.join(this.storagePath, `${id}.pdf`);
        const metadataPath = path.join(this.storagePath, `${id}.json`);
        if (!fs.existsSync(filePath) || !fs.existsSync(metadataPath)) {
            return null;
        }
        const content = fs.readFileSync(filePath);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
        const pdf = new pdf_entity_1.Pdf(metadata.id, metadata.filePath, content, metadata.tags, metadata.name);
        return pdf;
    }
    async generatePdf(content, id, filePath, tags, name) {
        const pdf = new pdf_entity_1.Pdf(id, filePath, Buffer.from(content, 'base64'), tags, name);
        await this.save(pdf);
        return pdf;
    }
};
exports.PdfRepositoryImpl = PdfRepositoryImpl;
exports.PdfRepositoryImpl = PdfRepositoryImpl = __decorate([
    (0, common_1.Injectable)()
], PdfRepositoryImpl);
//# sourceMappingURL=pdf.repository.impl.js.map