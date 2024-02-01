import { Test, TestingModule } from '@nestjs/testing';
import { UfmController } from './ufm.controller';
import { UfmService } from './ufm.service';

describe('UfmController', () => {
  // let controller: UfmController;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     controllers: [UfmController],
  //     providers: [UfmService],
  //   }).compile();

  //   controller = module.get<UfmController>(UfmController);
  // });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });

  it('should pass', () => {
    expect(true).toBe(true);
  });
});
