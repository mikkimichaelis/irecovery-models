import { last } from 'lodash';
import { DateTime, Duration } from 'luxon';
import { Meeting } from './meeting';
import { IUser } from './user.class';
export interface IAttendanceRecord {
    aid: string;

    local: string;      // client populated
    timestamp: number;  // UTC Millis from device

    status: string;     // [Zoom.MeetingStatus] || ['MEETING_ACTIVE_TRUE', 'MEETING_ACTIVE_FALSE']
    visible: boolean;   // Video Activity visible
    volume: number;     // device call volume (not media!)
    audio: boolean;     // Zoom audio connected
    loud: boolean;      // speakerphone
    userCount: number,
    password: string,
    isMyAudioMuted: boolean,
    canUnmuteMyVideo: boolean,
    isMyVideoMuted: boolean,
    getPinnedUser: number,
    activeVideoUserID: number
}

export class AttendanceRecord implements IAttendanceRecord {
    aid: string = <any>null;

    local: string = <any>null;
    timestamp: number = DateTime.now().toMillis();

    // Zoom data
    status: string = <any>null;
    visible: boolean = <any>null;
    volume: number = <any>null;
    audio: boolean = <any>null;
    loud: boolean = <any>null;
    userCount: number = 0;
    password: string = <any>null;
    isMyAudioMuted: boolean = <any>null;
    canUnmuteMyVideo: boolean = <any>null;
    isMyVideoMuted: boolean = <any>null;
    getPinnedUser: number = <any>null;
    activeVideoUserID: number = <any>null;

    // TODO bug here...same as below
    // @ts-ignore
    constructor(record: any) {
        this.local = DateTime.fromMillis(this.timestamp).toFormat('ttt');
    }
}

export enum AttendanceStatus {
    unknown = 'unknown',                // initial creation
    active = 'active',                  // meeting is active
    processed = 'processed',            // attendance is processed
    invalid = 'invalid',                // failed processing
}
export interface IAttendance {
    version: number;                            // attendance algorithm version

    uid: string;            // User.id
    mid: string;            // Meeting.id
    arid: string;           // AttendanceReport.id
    zid: string;            // Zoom meeting number (same as Meeting.zid)
    uzid: string;           // Unique Zoom Meeting id for this occurrence
    zpid: string;           // Zoom Participant id
    zuid: string;           // Zoom User ID

    __submit: boolean;
    produced: number;
    __produced$: string;
    __deleted: boolean;

    _timezone: string;       // tz of user at time of attendance
    timestamp: number;

    ___status: AttendanceStatus;
    ___valid: boolean;
    log: string[];          // verbose translation of attendanceRecords and accounting ledger for credit

    _meetingStartTime$: string;
    _meetingDuration$: string;
    _meetingName$: string;

    date: string;
    start: number; __start$: string;                // utc millis when participation started
    end: number; __end$: string;                    // local utc millis when participation ended
    duration: number; __duration$: string;          // millis end - start
    credit: number; __credit$: string;              // millis ___valid amount of duration credited for attendance (see log)
    processed: number; _processed$: string;         // server utc millis processed or null
    updated: number; _updated$: string;             // server utc millis last updated

    user: IUser;            // [attached] Copies of user and meeting data at time of attendance
    meeting: Meeting;      // [attached] Set server side when processed
    records: IAttendanceRecord[];   // [attached]

    invalid: boolean;   // added to invalidate invalid records (missing meetings)


    isValid(): Promise<boolean>;
    repair(): Promise<IAttendance>
    update(meeting?: Meeting): void;
    process(): Promise<boolean>;
}
export class Attendance implements IAttendance {

    version: number = 72;

    uid: string = <any>'';
    mid: string = <any>'';
    arid: string = <any>'';
    zid: string = <any>'';
    uzid: string = <any>'';
    zpid: string = <any>'';
    zuid: string = <any>'';

    __submit: boolean = false;
    produced: number = 0; __produced$: string = '';
    __deleted: boolean = false;

    _timezone: string = <any>'';
    timestamp: number = DateTime.now().toMillis();

    ___status: AttendanceStatus = AttendanceStatus.unknown;
    ___valid: boolean = false;
    log: string[] = [];

    _meetingStartTime$: string = <any>'';
    _meetingDuration$: string = <any>'';
    _meetingName$: string = <any>'';

    date: string = <any>null;
    start: number = DateTime.now().toMillis(); __start$: string = <any>null;                // server populated millis
    end = 0; __end$: string = <any>null;                              // server populated millis
    duration = 0; __duration$: string = <any>null;                    // server populated millis
    durationHHMM$: string = <any>null;
    credit = 0; __credit$: string = <any>null;                        // server populated millis

    processed = 0; _processed$: string = <any>null;          // server populated millis
    updated = 0; _updated$: string = <any>null;              // server populated millis

    // EXCLUDED!
    user: IUser = <any>null;
    meeting: Meeting = <any>null;
    records: IAttendanceRecord[] = [];

    invalid = false;

    toObject() {
        // list properties that are static or computed or attached and
        // should not be serialized into the database with this document
        // const exclude: string[] = ['user', 'meeting', 'records', 'reentry'];
    }

    public update(meeting?: Meeting) {
        if (this.start > 0) this.__start$ = DateTime.fromMillis(this.start).setZone(<any>this._timezone).toFormat('FFF');
        if (this.end > 0) this.__end$ = DateTime.fromMillis(this.end).setZone(<any>this._timezone).toFormat('FFF');
        if (this.produced > 0) this.__produced$ = DateTime.fromMillis(this.produced).setZone(<any>this._timezone).toFormat('FFF');
        if (this.processed > 0) this._processed$ = DateTime.fromMillis(this.processed).setZone(<any>this._timezone).toFormat('FFF');

        if (this.duration > 0) {
            this.__duration$ = Duration.fromMillis(this.duration).toFormat('hh:mm:ss');
            this.durationHHMM$ = this.__duration$.substring(0, 5);   // make hh:mm for UI
        }

        this.__credit$ = Duration.fromMillis(this.duration).toFormat('hh:mm:ss');

        if (meeting) {
            this._meetingName$ = meeting.name;
            this._meetingDuration$ = meeting.continuous ? 'Continuous' : Duration.fromObject({ minutes: meeting.duration }).toFormat('hh:mm:ss');
        }

        this.date = DateTime.fromMillis(this.start).setZone(this._timezone).toFormat('M/d/yy');
        this.updated = DateTime.now().toMillis();
        this._updated$ = DateTime.fromMillis(this.updated).setZone(<any>this._timezone).toFormat('FFF');
    }

    /*
        returns true if ___valid
        otherwise throws invalid reason
    */
    public async isValid(): Promise<boolean> {
        // order records by timestamp
        this.sort();

        // repair() depends on this specific ordering to diagnosis.
        // specifically 'invalid records length' must be throw last (let other possibly fixable errors be thrown first :-))
        // TODO may be old comments above, update to find vs head/last
        if (-1 === this.records.findIndex(record => record.status === 'MEETING_ACTIVE_TRUE')) throw new Error('invalid MEETING_ACTIVE_TRUE');
        if (-1 === this.records.findIndex(record => record.status === 'MEETING_ACTIVE_FALSE')) throw new Error('invalid MEETING_ACTIVE_FALSE');
        if (-1 === this.records.findIndex(record => record.status === 'MEETING_STATUS_INMEETING')) throw new Error('invalid MEETING_STATUS_INMEETING');
        // if (-1 === this.records.findIndex(record => record.status === 'MEETING_STATUS_INMEETING')) throw new Error('invalid MEETING_STATUS_INMEETING');
        // if (this.records.length < 3) debugger; // throw new Error('invalid records length');
        return true;
    }

    /*
        if isValid return this
        if ! attempt to repair issue
            if repaired throw this (doing this allows caller to differentiate between a valid this return or a repaired this throw)
            if ! rethrow original isValid error (so caller knows the failure reason (and can log it properly))
    */
    public async repair(): Promise<IAttendance> {
        this.sort();

        await this.isValid().catch(async error => { // throws diagnostic error message 
            let repair: any = { ...last, ...{ ___status: 'MEETING_ACTIVE_FALSE', id: null } };
            switch (error.message) {
                case 'invalid MEETING_ACTIVE_TRUE':
                    // 
                    throw error;
                case 'invalid MEETING_STATUS_INMEETING':
                    throw error;
                case 'invalid MEETING_ACTIVE_FALSE':                // this is what repairs a power loss while in meeting   
                    // let _last = last(this.records);                 // get last record to use as template for missing MEETING_ACTIVE_FALSE
                    // getting last is valid due to sort() in above isValid()
                    
                    repair = new AttendanceRecord(repair);
                    this.records.push(repair);                       // replace missing record
                    // let repaired = null;
                    // if (repaired = await this.isValid().catch(error => { throw error; })) throw repaired;
                    break;
                case 'invalid record length':
                    throw error;
                default:
                    throw error;
            }
        });
        return this;
    }

    /*
        Attendance is processed when the meeting ends.
    */
    public async process(): Promise<boolean> {
        this.sort();
        return new Promise<boolean>(async (resolve, reject) => {
            try {
                this.updated = DateTime.now().toMillis();
                this.log = [];
                this.___valid = await this.isValid().catch(() => false);
                if (!this.___valid) {
                    // @ts-ignore
                    this.end = last(this.records)?.timestamp;
                    this.duration = this.end - this.start;
                    this.credit = 0;
                    this.___status = AttendanceStatus.invalid;
                } else {
                    this.end = (<any>last(this.records)).timestamp;
                    this.duration = this.end - this.start;
                    this.credit = this.duration;
                    this.___status = AttendanceStatus.processed;
                }

                this.processed = DateTime.now().toMillis();
                this.update();
                this.log.push(`${DateTime.fromMillis(this.processed).setZone(<any>this._timezone).toFormat('ttt')} PROCESSED ${this.___valid ? 'VALID' : 'INVALID'} ${this.__credit$}s CREDIT`)

                resolve(true);
            } catch (error) {
                resolve(false);
            }
        })
    }

    public sort() {
        this.records = this.records.sort((x, y) => {
            if (x.timestamp < y.timestamp) return -1;
            if (x.timestamp > y.timestamp) return 1;
            return 0;
        });
    }

    // public addRecord(record: any) {
    //     if (['MEETING_ACTIVE_FALSE', 'MEETING_ACTIVE_TRUE]'].indexOf(record.___status) == -1) {
    //         // update with zoom meeting values
    //         // these are not available for MEETING_ACTIVE_TRUE || MEETING_ACTIVE_FALSE events.
    //         // We must wait a few seconds after MEETING_ACTIVE_TRUE to receive
    //         // this data in the first ZoomVisibleTask event providing visibility ___status, etc.
    //         this.zid = record.zid;
    //         this.zpid = record.zpid;
    //         this.uzid = record.uzid;
    //         this.zuid = record.zuid;
    //     }
    //     this.records.push(new AttendanceRecord(record));
    // }


    // this.records.forEach((r, index, records) => {
    //     let log = '';
    //     switch (r.status) {
    //         case 'MEETING_ACTIVE_TRUE':
    //             period_start = r.timestamp;             // start a period
    //             this.log.push(`${r.local} START`)
    //             break;
    //         case 'MEETING_ACTIVE_FALSE':
    //             if (period_start) {
    //                 const duration = Duration.fromMillis(r.timestamp - period_start);
    //                 this.credit += duration.toMillis();
    //                 this.log.push(`${r.local} END ${duration.toFormat('hh:mm:ss')}s CREDIT`);
    //             } else {
    //                 // invalid Attendance
    //             }
    //             period_start = null;
    //             break;
    //         case 'MEETING_STATUS_INMEETING':
    //             if (log === '') {
    //                 if (!period_start) {
    //                     period_start = r.timestamp; // start a period

    //                     if (index > 0) {
    //                         const duration = Duration.fromMillis(r.timestamp - records[index - 1].timestamp);
    //                         this.log.push(`${r.local} START ${duration.toFormat('hh:mm:ss')}s SKIPPED`);
    //                     } else {
    //                         this.log.push(`${r.local} START`)
    //                     }
    //                 } else {
    //                     // skip this MEETING_STATUS_INMEETING .. we are already in a period
    //                 }
    //             } else {
    //                 if (period_start) {
    //                     // end existing period
    //                     const duration = Duration.fromMillis(r.timestamp - period_start);
    //                     this.credit = this.credit + duration.toMillis();
    //                     this.log.push(`${r.local} END ${log} ${duration.toFormat('hh:mm:ss')}s CREDIT`);
    //                     period_start = null;
    //                 } else {
    //                     // skip this MEETING_STATUS_INMEETING .. this record is not ___valid & we're not in a period anyway
    //                 }
    //             }
    //             break;
    //         default:
    //             throw new Error(`UNKNOWN STATUS: ${r.status}`);
    //     }

    //     this.end = r.timestamp;
    // });
}