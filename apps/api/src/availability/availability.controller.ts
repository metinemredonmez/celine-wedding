import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import {
  AvailabilityRuleDto,
  UpdateAvailabilityRuleDto,
} from './dto/availability-rule.dto';
import { BlockedDateDto } from './dto/blocked-date.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // ─────────────────────────── PUBLIC ───────────────────────────

  @Get()
  @ApiQuery({ name: 'date', example: '2026-07-15', description: 'YYYY-MM-DD' })
  @ApiOkResponse({ description: 'Bookable time slots for the given day.' })
  getSlots(@Query('date') date: string) {
    return this.availabilityService.getSlots(date);
  }

  // ─────────────────── ADMIN: availability rules ───────────────────

  @Get('rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Weekly availability rules (admin).' })
  listRules() {
    return this.availabilityService.listRules();
  }

  @Post('rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createRule(@Body() dto: AvailabilityRuleDto) {
    return this.availabilityService.createRule(dto);
  }

  @Patch('rules/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateRule(@Param('id') id: string, @Body() dto: UpdateAvailabilityRuleDto) {
    return this.availabilityService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removeRule(@Param('id') id: string) {
    return this.availabilityService.removeRule(id);
  }

  // ─────────────────── ADMIN: blocked days ───────────────────

  @Get('blocked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Full-day closures (admin).' })
  listBlocked() {
    return this.availabilityService.listBlocked();
  }

  @Post('blocked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createBlocked(@Body() dto: BlockedDateDto) {
    return this.availabilityService.createBlocked(dto);
  }

  @Delete('blocked/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removeBlocked(@Param('id') id: string) {
    return this.availabilityService.removeBlocked(id);
  }
}
