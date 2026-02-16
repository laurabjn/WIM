// test/unit/application/get-health.usecase.spec.ts
import { GetHealthUseCase } from '../../../src/application/use-cases/get-health.usecase';

describe('GetHealthUseCase', () => {
  it('should return status ok', () => {
    const useCase = new GetHealthUseCase();

    const result = useCase.execute();

    expect(result).toEqual({ status: 'ok' });
  });
});
