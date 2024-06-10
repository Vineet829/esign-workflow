import { Test, TestingModule } from '@nestjs/testing';
import { GetPdfUseCase } from './get-pdf.usecase';
import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { Pdf } from '../../domain/entities/pdf.entity';

describe('GetPdfUseCase', () => {
  let getPdfUseCase: GetPdfUseCase;
  let pdfRepository: PdfRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPdfUseCase,
        {
          provide: 'PdfRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    getPdfUseCase = module.get<GetPdfUseCase>(GetPdfUseCase);
    pdfRepository = module.get<PdfRepository>('PdfRepository');
  });

  it('should return Pdf when it exists', async () => {
    const pdfId = '12345';
    const filePath = '/path/to/file';
    const tags = ['tag1', 'tag2'];
    const content = Buffer.from('content'); 

    const mockPdf = new Pdf(pdfId, filePath, content, tags, `document-${pdfId}`);
    (pdfRepository.findById as jest.Mock).mockResolvedValue(mockPdf);

    const result = await getPdfUseCase.execute(pdfId);

    expect(result).toEqual(mockPdf);
  });
});
