import { Test, TestingModule } from '@nestjs/testing';
import { ArchivedPaymentsService } from './archived-payments.service';

describe('ArchivedPaymentsService', () => {
  let service: ArchivedPaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArchivedPaymentsService],
    }).compile();

    service = module.get<ArchivedPaymentsService>(ArchivedPaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
