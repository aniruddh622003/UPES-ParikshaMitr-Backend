export const JwtService = jest.fn().mockReturnValue({
  verifyAsync: jest.fn().mockResolvedValue({
    id: '659d39aa4043122701a08c28',
    sap_id: 500086707,
    name: 'Aniruddh Dev Upadhyay',
  }),
  signAsync: jest
    .fn()
    .mockResolvedValue(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OWQzOWFhNDA0MzEyMjcwMWEwOGMyOCIsInNhcF9pZCI6NTAwMDg2NzA3LCJuYW1lIjoiQW5pcnVkZGggRGV2IFVwYWRoeWF5IiwiaWF0IjoxNzA0ODgzNTE2fQ.A4HgoX772BaWM3yESWRTbS3wvXT_4PV_k2_tDX1IRYU',
    ),
});
