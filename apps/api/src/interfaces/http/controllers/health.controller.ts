import { Controller, Get } from '@nestjs/common';
import { GetHealthUseCase } from '../../../application/use-cases/get-health.usecase';

@Controller()
export class HealthController {
  constructor(private readonly getHealthUseCase: GetHealthUseCase) {}

  @Get('health')
  getHealth() {
    return this.getHealthUseCase.execute();
  }
}
