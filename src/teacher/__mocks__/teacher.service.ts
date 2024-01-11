import { HttpException } from '@nestjs/common';
import {
  createTeacherResp,
  findTeacherID,
  findTeacherbyIDResp,
  loginTeacherResp,
} from '../../../test/stubs/teacher.stub';

export const TeacherService = jest.fn().mockReturnValue({
  create: jest.fn().mockResolvedValue(createTeacherResp()),
  login: jest.fn().mockResolvedValue(loginTeacherResp()),
  findOne: jest.fn().mockImplementation((id) => {
    if (id === findTeacherID()) {
      return Promise.resolve(findTeacherbyIDResp());
    }
    return Promise.reject(
      new Error('Teacher with the given ID does not exist in the database'),
    );
  }),
});
