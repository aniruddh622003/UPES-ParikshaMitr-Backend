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
