import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateHomeAvailabilityUseCase } from 'src/application/home/use-cases/create-home-availability.usecase';
import { DeleteHomeAvailabilityUseCase } from 'src/application/home/use-cases/delete-home-availability.usecase';
import { ListHomeAvailabilitiesUseCase } from 'src/application/home/use-cases/list-home-availabilities.usecase';
import { CreateHomeAvailabilityDto } from '../dtos/home/create-home-availability.dto';
import { JwtAuthGuard } from '../jwt-auth.guard';

@Controller('homes/:homeId/availabilities')
export class HomeAvailabilityController {
  constructor(
    private readonly createHomeAvailabilityUseCase: CreateHomeAvailabilityUseCase,
    private readonly listHomeAvailabilitiesUseCase: ListHomeAvailabilitiesUseCase,
    private readonly deleteHomeAvailabilityUseCase: DeleteHomeAvailabilityUseCase,
  ) {}

  @Get()
  async list(@Param('homeId') homeId: string) {
    return this.listHomeAvailabilitiesUseCase.execute(homeId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('homeId') homeId: string,
    @Body() dto: CreateHomeAvailabilityDto,
    @Req() req: any,
  ) {
    return this.createHomeAvailabilityUseCase.execute({
      homeId,
      userId: req.user.sub,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      type: dto.type,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':availabilityId')
  async delete(
    @Param('homeId') homeId: string,
    @Param('availabilityId') availabilityId: string,
    @Req() req: any,
  ) {
    await this.deleteHomeAvailabilityUseCase.execute({
      homeId,
      availabilityId,
      userId: req.user.sub,
    });

    return { success: true };
  }
}