import { Test, TestingModule } from '@nestjs/testing';
import { ArchivedPaymentsController } from './archived-payments.controller';
import { ArchivedPaymentsService } from './archived-payments.service';

describe('ArchivedPaymentsController', () => {
  let controller: ArchivedPaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArchivedPaymentsController],
      providers: [ArchivedPaymentsService],
    }).compile();

    controller = module.get<ArchivedPaymentsController>(ArchivedPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
