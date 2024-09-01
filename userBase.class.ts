import { isEmpty } from 'lodash';
import { Md5 } from 'ts-md5';

export interface IUserBase {
    name: string;
    avatar: string;
    role: string;
}

export class UserBase implements IUserBase {
    name: string    = '';
    avatar: string  = '';
    role: string    = 'user';

    constructor(userBase?: any) {
        if( isEmpty(this.avatar) ) {
            const md5 = new Md5();
            // this.avatar = `https://www.gravatar.com/avatar/${md5.appendStr(`${this.id.toLowerCase()}@anonymousmeetings.app`).end()}?d=identicon`;
        }
    }
}
