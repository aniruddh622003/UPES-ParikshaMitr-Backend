import { Test, TestingModule } from '@nestjs/testing';
import { FlyingController } from './flying.controller';
import { FlyingService } from './flying.service';

describe('FlyingController', () => {
  let controller: FlyingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlyingController],
      providers: [FlyingService],
    }).compile();

    controller = module.get<FlyingController>(FlyingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
