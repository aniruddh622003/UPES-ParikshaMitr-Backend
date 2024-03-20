import { Test, TestingModule } from '@nestjs/testing';
import { FlyingService } from './flying.service';

describe('FlyingService', () => {
  let service: FlyingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlyingService],
    }).compile();

    service = module.get<FlyingService>(FlyingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
