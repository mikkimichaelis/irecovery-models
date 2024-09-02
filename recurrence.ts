import Realm, { ObjectSchema } from 'realm';

export enum RecurrenceType {
    NONE = '',
    CONTINUOUS = 'Continuous',
    DAILY = 'Daily',
    WEEKLY = 'Weekly'
}

// export interface IRecurrence {
//     type: RecurrenceType;
//     weekly_day: string;
//     weekly_days: string[];
// }

export class Recurrence extends Realm.Object<Recurrence> {
    static schema: ObjectSchema = {
        name: 'Recurrence',
        embedded: true,
        properties: {
            type:  'string?',
            weekly_day: 'string?',
            weekly_days: 'string[]'
        },
    }

    type: RecurrenceType = RecurrenceType.NONE;
    weekly_day: string = '';
    weekly_days: string[] = [];
}