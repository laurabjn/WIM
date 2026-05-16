import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateSupportRequestUseCase } from 'src/application/support/use-cases/create-support-request.usecase';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { CreateSupportRequestHttpDto } from '../dtos/create-support-request.http.dto';

@Controller('support')
export class SupportController {
  constructor(
    private readonly createSupportRequestUseCase: CreateSupportRequestUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('contact')
  async createSupportRequest(
    @Req() req: any,
    @Body() dto: CreateSupportRequestHttpDto,
  ) {
    const created = await this.createSupportRequestUseCase.execute(
      req.user.sub,
      dto,
    );

    return {
      id: created.id,
      status: created.status,
      message: 'Support request created successfully',
    };
  }
}