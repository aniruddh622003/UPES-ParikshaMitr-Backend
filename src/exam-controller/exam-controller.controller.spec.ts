import { Test, TestingModule } from '@nestjs/testing';
import { ExamControllerController } from './exam-controller.controller';
import { ExamControllerService } from './exam-controller.service';

describe('ExamControllerController', () => {
  let controller: ExamControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamControllerController],
      providers: [ExamControllerService],
    }).compile();

    controller = module.get<ExamControllerController>(ExamControllerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
