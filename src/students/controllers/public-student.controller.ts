import { Controller, Get, Param, Req, BadRequestException } from '@nestjs/common';
import { StudentCodeService } from '../services/student-code.service';
import { Request } from 'express';

@Controller('public/student')
export class PublicStudentController {
  constructor(private readonly studentCodeService: StudentCodeService) {}

  @Get('payments/:studentCode')
  async getStudentPayments(
    @Param('studentCode') studentCode: string,
    @Req() request: Request,
  ) {
    if (!studentCode || !request.ip) {
      throw new BadRequestException('Invalid request parameters');
    }
    return this.studentCodeService.getStudentPaymentsByCode(studentCode, request.ip);
  }
} 