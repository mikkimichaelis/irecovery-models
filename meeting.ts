export enum VerifiedStatus {
    // ordering here is important as it's used for sorting in api->getNextMeetingVerification()
    FAILED,     // quick-fail - invalid id or meeting not exists
    SUCCESS,    // yei!
    EMPTY,      // success but empty
    PASSWORD,   // this is technically a
    WAITING,    // valid id but not started
    NONE,       // never been verified
}

export class Meeting {
    id: string = '';
    schedule: any = null;
    hash: string = '';
    updated: number = 0;
    active: boolean = true;
    authorized: boolean = true;
    verified: boolean = true;
    verified_status: number = VerifiedStatus.SUCCESS;
    verified_date: number = 0;
    meetingUrl: string = '';
    zid: string = '';
    password: string = '';
    _passwordEnc: string = '';
    requiresLogin: boolean = false;
    closed: boolean = false;
    restricted: boolean = false;
    restrictedDescription: string = '';
    language: string = '';
    location: string= '';
    groupType: string = '';
    meetingTypes: string[] = [];
    name: string = '';
    description: string= '';
    tags: string[] = [];
    continuous: boolean = false;
    // recurring: boolean;
    timezone: string = '';
    time24h: string = '';
    dayOfWeek: string= '';
    duration: number = 0;
    startDateTime: number = 0;
    endDateTime: number = 0;
};
