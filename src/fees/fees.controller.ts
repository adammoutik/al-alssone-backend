import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { FeesService } from './fees.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFeeDto } from './dto/create-fee.dto';
import { UpdateFeeDto } from './dto/update-fee.dto';

@ApiTags('Fees')
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a fee' })
  @ApiResponse({ status: 201, description: 'Fee created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() createFeeDto: CreateFeeDto) {
    return this.feesService.create(createFeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all fees' })
  async findAll() {
    return this.feesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get fee details' })
  @ApiResponse({ status: 404, description: 'Fee not found.' })
  async findOne(@Param('id') id: string) {
    return this.feesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update fee' })
  @ApiResponse({ status: 404, description: 'Fee not found.' })
  async update(@Param('id') id: string, @Body() updateFeeDto: UpdateFeeDto) {
    return this.feesService.update(id, updateFeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete fee' })
  @ApiResponse({ status: 404, description: 'Fee not found.' })
  async remove(@Param('id') id: string) {
    return this.feesService.remove(id);
  }
}