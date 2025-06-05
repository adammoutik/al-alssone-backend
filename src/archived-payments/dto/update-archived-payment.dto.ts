import { PartialType } from '@nestjs/mapped-types';
import { CreateArchivedPaymentDto } from './create-archived-payment.dto';

export class UpdateArchivedPaymentDto extends PartialType(CreateArchivedPaymentDto) {}
