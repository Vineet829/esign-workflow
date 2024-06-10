import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { PdfController } from './interfaces/controllers/pdf.controller';
import { CreatePdfUseCase } from './application/use-cases/create-pdf.usecase';
import { GetPdfUseCase } from './application/use-cases/get-pdf.usecase';
import { PdfRepositoryImpl } from './infrastructure/repositories/pdf.repository.impl';
import { ZohoEsignService } from './infrastructure/services/zoho-esign.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
  ],
  controllers: [PdfController],
  providers: [
    {
      provide: 'PdfRepository',
      useClass: PdfRepositoryImpl,
    },
    CreatePdfUseCase,
    GetPdfUseCase,
    ZohoEsignService,
  ],
})
export class AppModule {}
