import { isEmpty } from 'lodash';

export interface IUserBase {
    name: string;
    avatar: string;
    role: string;
}

export class UserBase implements IUserBase {
    name = '';
    avatar = '';
    role = 'user';

    constructor(userBase?: any) {
        if( isEmpty(this.avatar) ) {
            // this.avatar = `https://www.gravatar.com/avatar/${md5.appendStr(`${this.id.toLowerCase()}@anonymousmeetings.app`).end()}?d=identicon`;
        }
    }
}
