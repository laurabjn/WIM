import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { StudentService } from 'src/application/subscription/student.service';
import { JwtAuthGuard } from '../jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: { sub: string; email: string };
}

@Controller('students')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly students: StudentService) {}

  @Get('me')
  async mien(@Req() req: AuthenticatedRequest) {
    return this.students.etat(req.user.sub);
  }

  @Post('code')
  @HttpCode(HttpStatus.OK)
  async envoyerUnCode(
    @Req() req: AuthenticatedRequest,
    @Body() body: { email?: string },
  ) {
    if (!body?.email?.trim()) {
      throw new BadRequestException('Adresse manquante.');
    }

    return this.students.envoyerUnCode(req.user.sub, body.email);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmer(
    @Req() req: AuthenticatedRequest,
    @Body() body: { code?: string },
  ) {
    if (!body?.code?.trim()) {
      throw new BadRequestException('Code manquant.');
    }

    return this.students.confirmer(req.user.sub, body.code);
  }
}
