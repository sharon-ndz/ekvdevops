import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './Instructor.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Instructor')
@Controller('instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) { }

  // create instructor
  @ApiOperation({
    summary: 'Create instructor (Super Admin)',
  })
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @AllowedRoles(Role.LASDRI_ADMIN)
  @Post('/')
  create(@Body() data: CreateInstructorDto, @Req() req) {
    return this.instructorService.create(data);
  }

  // validate instructor by instructorId
  @ApiOperation({
    summary: 'Validate instructor',
  })
  @Get('/validate/:instructorId')
  validateInstructor(@Param('instructorId') instructorId: string) {
    return this.instructorService.validateInstructor(instructorId);
  }
}
