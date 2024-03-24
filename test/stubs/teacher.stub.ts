export const createTeacherReq = () => {
  return {
    sap_id: 500086707,
    name: 'Aniruddh Dev Upadhyay',
    password: 'aniruddh13',
  };
};

export const createTeacherResp = () => {
  return {
    message: 'Teacher created successfully',
    data: {
      sap_id: 500086707,
      name: 'Aniruddh Dev Upadhyay',
      approved: false,
    },
  };
};

export const loginTeacherReq = () => {
  return {
    sap_id: 500086707,
    password: 'aniruddh13',
  };
};

export const loginTeacherResp = () => {
  return {
    message: 'Login successful',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWQzOWFhNDA0MzEyMjcwMWEwOGMyOCIsInNhcF9pZCI6NTAwMDg2NzA3LCJuYW1lIjoiQW5pcnVkZGggRGV2IFVwYWRoeWF5IiwiaWF0IjoxNzA0ODM4NDM3LCJleHAiOjE3MDQ5MjQ4Mzd9.o9h5vznkR3CzesGaTP7X36rwpUXJboKPrk5p_ZrV00Y',
  };
};

export const findTeacherID = () => {
  return '659d39aa4043122701a08c28';
};

export const findTeacherbyIDResp = () => {
  return {
    message: 'Teacher found',
    data: {
      sap_id: 500086707,
      name: 'Aniruddh Dev Upadhyay',
      approved: false,
    },
  };
};
