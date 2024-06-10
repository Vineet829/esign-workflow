import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  HttpStatus,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { CreatePdfDto } from '../dtos/create-pdf.dto';
import { CreatePdfUseCase } from '../../application/use-cases/create-pdf.usecase';
import { GetPdfUseCase } from '../../application/use-cases/get-pdf.usecase';
import { ZohoEsignService } from '../../infrastructure/services/zoho-esign.service';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Pdf } from '../../domain/entities/pdf.entity';
import * as fs from 'fs';

@Controller('pdf')
export class PdfController {
  constructor(
    private readonly createPdfUseCase: CreatePdfUseCase,
    private readonly getPdfUseCase: GetPdfUseCase,
    private readonly zohoEsignService: ZohoEsignService,
  ) {}

  @Post()
  async create(@Body() createPdfDto: CreatePdfDto): Promise<any> {
    if (!createPdfDto.content) {
      throw new BadRequestException('Content is required');
    }

    const contentBuffer = Buffer.isBuffer(createPdfDto.content)
      ? createPdfDto.content
      : Buffer.from(createPdfDto.content, 'base64');

    try {
      const uniqueId = uuidv4();
      const result = await this.createPdfUseCase.execute(
        contentBuffer.toString(),
        uniqueId,
        createPdfDto.filePath,
        createPdfDto.tags,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async get(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const filePath = join(process.cwd(), 'uploads', `${id}.pdf`);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.status(HttpStatus.NOT_FOUND).send('PDF not found');
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${id}.pdf`);
      res.status(HttpStatus.OK).send(data);
    });
  }

  @Get(':id/preview')
  async previewPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const filePath = join(process.cwd(), 'uploads', `${id}.pdf`);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.status(HttpStatus.NOT_FOUND).send('PDF not found');
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.status(HttpStatus.OK).send(data);
    });
  }

  @Post(':id/submit')
  async submit(
    @Param('id') id: string,
    @Body('recipientEmail') recipientEmail: string,
  ): Promise<any> {
    const filePath = join(process.cwd(), 'uploads', `${id}.pdf`);

    try {
      const content = fs.readFileSync(filePath);

      const isPdfValid = validatePdf(content);

      if (!isPdfValid) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid PDF format',
        };
      }

      const response = await this.zohoEsignService.sendForSignature(
        new Pdf(
          id,
          filePath,
          content,
          [content.length.toString()],
          'application/pdf',
        ),
        recipientEmail,
      );
      console.log(response);

      return {
        status: HttpStatus.OK,
        message: 'PDF submitted for signature',
        data: response,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: './uploads', 
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const fileExtName = extname(file.originalname);
          const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtName}`;
          callback(null, fileName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return callback(
            new BadRequestException('Only PDF files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, 
      },
    }),
  )
  async uploadPdf(@UploadedFile() file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    
    const filePath = file.path;

    const pdf = new Pdf(
      file.filename,
      filePath,
      file.buffer,
      [file.size.toString()],
      'application/pdf',
    );

    
    const updatedPdf = await this.zohoEsignService.addEsignTags(pdf);

    return {
      status: HttpStatus.OK,
      message: 'File uploaded and tags added successfully',
      filePath: updatedPdf.filePath, 
    };
  }
}

function validatePdf(content: Buffer): boolean {
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
