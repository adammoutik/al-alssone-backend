import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFamilyDto } from './dto/create-family.dto';
import { UpdateFamilyDto } from './dto/update-family.dto';

@ApiTags('Families')
@Controller('families')
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a family' })
  @ApiResponse({ status: 201, description: 'Family created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() createFamilyDto: CreateFamilyDto) {
    return this.familiesService.create(createFamilyDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all families' })
  async findAll() {
    return this.familiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get family details' })
  @ApiResponse({ status: 404, description: 'Family not found.' })
  async findOne(@Param('id') id: string) {
    return this.familiesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update family' })
  @ApiResponse({ status: 404, description: 'Family not found.' })
  async update(@Param('id') id: string, @Body() updateFamilyDto: UpdateFamilyDto) {
    return this.familiesService.update(id, updateFamilyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete family' })
  @ApiResponse({ status: 404, description: 'Family not found.' })
  async remove(@Param('id') id: string) {
    return this.familiesService.remove(id);
  }
}