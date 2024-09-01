import Realm, { ObjectSchema } from 'realm';

export enum RecurrenceType {
    NONE = '',
    CONTINUOUS = 'Continuous',
    DAILY = 'Daily',
    WEEKLY = 'Weekly'
}

export interface IRecurrence {
    type:               RecurrenceType;     
    weekly_day:         string;
    weekly_days:        string[];
} 

export class Recurrence extends Realm.Object<Recurrence> implements IRecurrence {
    static schema: ObjectSchema = {
        name: 'Meeting',
        properties: {
            _id: { type: "objectId", default: () => new Realm.BSON.ObjectId() },
            sid: 'string',
            iid: 'string',
        },
        primaryKey: '_id'
    }
    _id:                Realm.BSON.ObjectId = new Realm.BSON.ObjectId();
    type:               RecurrenceType  = RecurrenceType.NONE;
    weekly_day:         string  = '';
    weekly_days:        string[] = [];
}