import { DateTime } from 'luxon';
import { IAttendance } from './attendance';
import { Meeting } from './meeting';
export interface IAttendanceReport {
    uid: string;
    version: number;
    timezone: string;       // tz of user at time of attendance
    created: number;        // server utc millis created
    created$: string;
    updated: number;

    attendances: string[]

    email: string; // recipient
    html: string;
    messageId: string;
    data: any; // { meetings: IMeeting[], attendance: IAttendance[] };

    date: string;
    end: string;
    start: string;
    total: string;
    total_credit: number;
    total_meetings: string;
    unsubscribe: string;
    user_email: string;
    user_name: string;
}

export class AttendanceReport implements IAttendanceReport {
    uid: string = '';
    version: number = 2;
    timezone: string = DateTime.now().zoneName as string;
    created: number = DateTime.now().toMillis();
    created$: string = '';
    updated: number = DateTime.now().toMillis();

    // the following are legacy
    // data included all data used to generate html report and data.attendance IAttendance[]
    // attendances was (poorly populated) list of aid's.
    data: any = {};
    attendances: string[] = [];

    // now we keep every thing orderly.
    meetings: Meeting[] = [];      // copies of all meetings as existed when reported
    attendance: IAttendance[] = []; // copies of all attendance as existed when reported

    email: string = <any>null;
    html: string = '<html></html>';
    messageId: string = '';

    date: string = ''
    end: string = '';
    start: string = '';
    total: string = '';
    total_credit: number = 0;
    total_meetings: string = '';
    unsubscribe: string = '';
    user_email: string = '';
    user_name: string = '';

    constructor(report?: any) {
        this.created$ = DateTime.fromMillis(this.created).setZone(this.timezone).toFormat('FFF');
    }
}