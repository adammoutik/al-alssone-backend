import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArchivedPaymentsService } from './archived-payments.service';
import { CreateArchivedPaymentDto } from './dto/create-archived-payment.dto';
import { UpdateArchivedPaymentDto } from './dto/update-archived-payment.dto';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';

@ApiTags('Archived Payments')
@Controller('archived-payments')
@UseGuards(JwtAuthGuard)
export class ArchivedPaymentsController {
  constructor(private readonly archivedPaymentsService: ArchivedPaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create archived payment' })
  @ApiResponse({ status: 201, description: 'Payment archived successfully' })
  create(@Body() createArchivedPaymentDto: CreateArchivedPaymentDto) {
    return this.archivedPaymentsService.create(createArchivedPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all archived payments' })
  findAll() {
    return this.archivedPaymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get archived payment by ID' })
  findOne(@Param('id') id: string) {
    return this.archivedPaymentsService.findOne(id);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get archived payments by student ID' })
  findByStudent(@Param('studentId') studentId: string) {
    return this.archivedPaymentsService.findByStudent(studentId);
  }

  @Get('family/:familyId')
  @ApiOperation({ summary: 'Get archived payments by family ID' })
  findByFamily(@Param('familyId') familyId: string) {
    return this.archivedPaymentsService.findByFamily(familyId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArchivedPaymentDto: UpdateArchivedPaymentDto) {
    return this.archivedPaymentsService.update(+id, updateArchivedPaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.archivedPaymentsService.remove(+id);
  }
}
