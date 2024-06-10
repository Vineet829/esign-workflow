"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const pdf_controller_1 = require("./interfaces/controllers/pdf.controller");
const create_pdf_usecase_1 = require("./application/use-cases/create-pdf.usecase");
const get_pdf_usecase_1 = require("./application/use-cases/get-pdf.usecase");
const pdf_repository_impl_1 = require("./infrastructure/repositories/pdf.repository.impl");
const zoho_esign_service_1 = require("./infrastructure/services/zoho-esign.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            axios_1.HttpModule,
        ],
        controllers: [pdf_controller_1.PdfController],
        providers: [
            {
                provide: 'PdfRepository',
                useClass: pdf_repository_impl_1.PdfRepositoryImpl,
            },
            create_pdf_usecase_1.CreatePdfUseCase,
            get_pdf_usecase_1.GetPdfUseCase,
            zoho_esign_service_1.ZohoEsignService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map