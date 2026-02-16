import { Module } from '@nestjs/common';
import { GetHealthUseCase } from '../../../application/use-cases/get-health.usecase';

@Module({
  providers: [GetHealthUseCase],
  exports: [GetHealthUseCase],
})
export class ApplicationModule {}
