export const CreateControllerReq = () => {
  return {
    name: 'Aniruddh Dev Upadhyay',
    username: 'aniupadh',
    password: 'aniruddh13',
  };
};

export const CreateControllerResp = () => {
  return {
    message: 'ExamController created successfully',
    data: {
      name: 'Aniruddh Dev Upadhyay',
    },
  };
};

export const LoginControllerReq = () => {
  return {
    username: 'aniupadh',
    password: 'aniruddh13',
  };
};

export const LoginControllerResp = () => {
  return {
    message: 'Login successful',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWVkODQ1Y2IxNjM1MTcyMTE1MDQzOSIsInVzZXJuYW1lIjoiYW5pdXBhZGgiLCJuYW1lIjoiQW5pcnVkZGggRGV2IFVwYWRoeWF5Iiwicm9sZSI6ImV4YW0tY29udHJvbGxlciIsImlhdCI6MTcwNDkyMDA3M30.BKSf9gCMPHxD_zaH9lNHBjtYQ2NereFQC23hKpNluxA',
  };
};
