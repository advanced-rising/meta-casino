import * as CryptoJS from 'crypto-js';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

class CryptoHelper {
  private aesSecret: string = null;
  private jwtSecret: string = null;
  private bcryptRound: number = null;

  public setup(props: { aesSecret?: string; jwtSecret?: string; bcryptRound?: number }) {
    this.aesSecret = props.aesSecret;
    this.jwtSecret = props.jwtSecret;
    this.bcryptRound = props.bcryptRound;
  }

  public aesEncrypt(plain: string): string {
    if (!this.aesSecret) throw new Error('You should initiate crypto-helper with aesSecret Property');

    return CryptoJS.AES.encrypt(plain, this.aesSecret).toString();
  }

  public aesDecrypt(encoded: string): string {
    if (!this.aesSecret) throw new Error('You should initiate crypto-helper with aesSecret Property');

    return CryptoJS.AES.decrypt(encoded, this.aesSecret).toString(CryptoJS.enc.Utf8);
  }

  public encodeJwt<T extends Object>(data: T) {
    if (!this.jwtSecret) throw new Error('You should initiate crypto-helper with jwtSecret Property');
    const jwtToken = jwt.sign({ ...data }, this.jwtSecret);

    return jwtToken;
  }

  public verifyJwt<T>(token: string) {
    if (!this.jwtSecret) throw new Error('You should initiate crypto-helper with jwtSecret Property');
    try {
      let decoded = jwt.verify(token, this.jwtSecret);

      return decoded as T;
    } catch (err) {
      throw new Error(`유효하지 않거나 만료된 jwt 토큰입니다. token :${token}`);
    }
  }

  public bcryptHash(password: string): string {
    if (!this.bcryptRound) throw new Error('You should initiate crypto-helper with bcryptRound Property');
    const salt = bcrypt.genSaltSync(this.bcryptRound);
    const hash = bcrypt.hashSync(password, salt);

    return hash;
  }

  public compareBcryptHash(plain: string, encoded: string): boolean {
    let isValid = bcrypt.compareSync(plain, encoded);

    return isValid;
  }
}

export const cryptoHelper = new CryptoHelper();
