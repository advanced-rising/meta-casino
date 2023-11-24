import { cryptoHelper } from '.';

cryptoHelper.setup({
  aesSecret: 'test1234',
  bcryptRound: 5,
  jwtSecret: 'test1234',
});
describe('Test crypto helper', () => {
  it('Test decode jwt', () => {
    const obj = { name: 'namhoon' };
    const jwt = cryptoHelper.encodeJwt(obj);
    expect(cryptoHelper.verifyJwt(jwt)).toMatchObject(obj);
  });

  it('Test Bcrypto hashing and compare', () => {
    const hash = cryptoHelper.bcryptHash('yct5pdr2ucx@DEA@tut');
    console.log({ hash });
  });
});
