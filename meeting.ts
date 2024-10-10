import { ObjectSchema, Realm } from 'realm';
import { Schedule } from './schedule';

export enum VerifiedStatus {
    // ordering here is important as it's used for sorting in api->getNextMeetingVerification()
    FAILED,     // quick-fail - invalid id or meeting not exists
    SUCCESS,    // yei!
    EMPTY,      // success but empty
    PASSWORD,   // this is technically a
    WAITING,    // valid id but not started
    NONE,       // never been verified
}

export class Meeting extends Realm.Object<Meeting> {
    static schema: ObjectSchema = {
        name: 'Meeting',
        primaryKey: '_id',
        properties: {
            _id: { type: "objectId", default: () => new Realm.BSON.ObjectId() },
            schedule: {
                type: "linkingObjects",
                objectType: "Schedule",
                property: "meetings",
            },
            hash: 'string',
            updated: 'int',
            active: 'bool',
            authorized: 'bool',
            verified: 'bool',
            verified_status: 'int',
            verified_date: 'int?',
            meetingUrl: 'string',
            zid: 'string',
            password: 'string?',
            _passwordEnc: 'string?',
            requiresLogin: 'bool',
            closed: 'bool',
            restricted: 'bool',
            restrictedDescription: 'string?',
            language: 'string',
            location: 'string?',
            groupType: 'string',
            meetingTypes: 'string[]',
            name: 'string',
            description: 'string?',
            tags: 'string[]',
            continuous: 'bool',
            // recurring: 'bool',
            timezone: 'string',
            time24h: 'string',
            dayOfWeek: 'string?',
            duration: 'int',
            startDateTime: { type: 'int', indexed: true },
            endDateTime: { type: 'int', indexed: true }
        }
    };

    _id: Realm.BSON.ObjectId = new Realm.BSON.ObjectId();
    schedule?: Realm.Collection<Schedule>;

    /*
          The hash is used to detect changes in data imported externally
          It does not take into account verified and other metadata
          Metadata is preserved when doing import updates
  
          updated is being excluded from the hash.  This allows
          a locally updated meeting to retain the same hash as an unchanged imported meeting,
          skipping update altogether.
      */
    hash = '';

    active = true;
    authorized = true;

    verified = false;
    verified_status = VerifiedStatus.NONE;
    verified_date = -1;

    meetingUrl = '';

    zid = '';
    password = '';
    _passwordEnc = '';
    requiresLogin = false;
    closed = false;
    restricted = false;
    restrictedDescription = '';

    language = 'en';
    location = '';

    name = '';

    groupType = '';
    meetingTypes: string[] = [];

    description = '';

    tags: string[] = ['tits'];

    timezone = 'America/New_York';
    time24h = '00:00';
    dayOfWeek = '';
    duration = 60;
    continuous = false;

    // startDateTime is a point in time this meeting starts which can be searched for within a window of time
    // this is used to search for meetings within a specific day
    startDateTime = -1; // Absolute start DateTime in UTC of Meeting startTime + weekday in Meeting timezone
    endDateTime = -1;

    updated = 0;
}
