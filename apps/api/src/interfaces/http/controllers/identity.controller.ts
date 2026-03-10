import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Req,
  Get,
} from '@nestjs/common';
import { GetIdentityStatusUseCase } from 'src/application/auth/use-cases/get-identity-status.usecase';
import { StartIdentityVerificationUseCase } from 'src/application/auth/use-cases/start-identity-verification.usecase';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    isAdmin?: boolean;
  };
}

@Controller('identity')
export class IdentityController {
  constructor(
    private readonly startIdentityVerificationUseCase: StartIdentityVerificationUseCase,
    private readonly getIdentityStatusUseCase: GetIdentityStatusUseCase,
  ) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  async start(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;

    const result = await this.startIdentityVerificationUseCase.execute({
      userId,
    });

    return result;
  }

  @Get('status')
  async status(@Req() req: AuthenticatedRequest) {
    const userId = req.user.sub;
    const result = await this.getIdentityStatusUseCase.execute({ userId });
    return result;
  }
}
