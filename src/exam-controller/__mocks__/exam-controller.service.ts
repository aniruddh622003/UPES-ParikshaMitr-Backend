import {
  CreateControllerResp,
  LoginControllerResp,
} from '../../../test/stubs/exam-controller.stub';

export const ExamControllerService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(CreateControllerResp()),
  login: jest.fn().mockResolvedValue(LoginControllerResp()),
});
