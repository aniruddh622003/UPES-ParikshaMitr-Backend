import {
  createTeacherResp,
  loginTeacherResp,
} from '../../../test/stubs/teacher.stub';

export const TeacherService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(createTeacherResp()),
  login: jest.fn().mockResolvedValue(loginTeacherResp()),
});
