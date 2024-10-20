import { DateTime } from "luxon";
import { isEmpty, isNil, join } from "lodash";
import { Meeting, VerifiedStatus } from "./meeting";
import { SpecificDay } from "./search-settings";


export class MeetingUtil extends Meeting {
    // - Mills till isLive ends
    // + Mills till isLive starts
    private _tminus?: number | null = null;
    get tMinus(): number | null {
        if (isNil(this._tminus)) {
            if (this.continuous) {
                this._tminus = 0;
            } else if (this.isLive) {
                this._tminus = this.endsIn * -1; // Millis till this meeting ends
                // negative value means 'ends in'
            } else {
                this._tminus = this.nextTime.toMillis() - DateTime.now().toMillis(); // Millis till this meeting ends
                // positive value means 'starts in'
            }
        }

        return this._tminus;
    }

    private _endsIn?: number | null = null;
    get endsIn(): number {
        // TODO make Duration
        if (isNil(this._endsIn)) {
            if (this.continuous) {
                this._endsIn = Number.MAX_VALUE;
            } else if (this.isLive) {
                const now = MeetingUtil.makeThat70sDateTime().toMillis();
                this._endsIn = this.startDateTime + this.duration * 60 * 1000 - now;
            } else {
                this._endsIn = null;
            }
        }
        return <any>this._endsIn;
    }

    private _isLive?: boolean | null = null;
    get isLive(): boolean | null {
        if (isNil(this._isLive)) {
            const now = MeetingUtil.makeThat70sDateTime().toMillis();
            this._isLive =
                this.continuous ||
                (this.startDateTime <= now &&
                    now <= this.startDateTime + this.duration * 60 * 1000); // start <= now <= end
        }
        return this.continuous || this._isLive;
    }

    private _startTimeString?: string | null = null;
    get startTimeString(): string | null {
        if (isNil(this._startTimeString)) {
            // if (this.isLive) return 'Live';

            let timeString = `${this.nextTime?.toFormat('h')}`;
            timeString =
                timeString +
                (this.nextTime?.minute === 0
                    ? ' - '
                    : `:${this.nextTime?.toFormat('mm')} - `);
            timeString =
                timeString +
                `${this.nextTimeEnd?.toFormat('h')}` +
                (this.nextTimeEnd?.minute === 0
                    ? ' '
                    : `:${this.nextTimeEnd?.toFormat('mm')} `);
            timeString = timeString + this.nextTime?.toFormat('a'); // (this.nextTime.weekday === DateTime.now().weekday ? this.daytimeString :
            this._startTimeString = timeString;
        }
        return this._startTimeString;
    }

    private _daytimeString?: string | null = null;
    get daytimeString(): string | null {
        // TODO https://moment.github.io/luxon/api-docs/index.html#datetimetorelativecalendar
        if (isNil(this._daytimeString)) {
            const nowMeridiem = DateTime.now().toFormat('a');
            const past = DateTime.now() > <any>this.nextTimeEnd;

            if (past) {
                switch (this.nextTime?.toFormat('a')) {
                    case 'AM':
                        if (nowMeridiem === 'PM') return 'Tomorrow';
                        else this._daytimeString = 'Tonight';
                        break;
                    case 'PM':
                        if (nowMeridiem === 'PM') return 'Tonight';
                        else this._daytimeString = 'Tomorrow';
                        break;
                }
                this._daytimeString = 'Tonight';
            } else {
                switch (this.nextTime?.toFormat('a')) {
                    case 'AM':
                        if (nowMeridiem === 'PM') return 'Tomorrow';
                        else this._daytimeString = 'Tonight';
                        break;
                    case 'PM':
                        if (nowMeridiem === 'PM') return 'Tonight';
                        else this._daytimeString = 'Tomorrow';
                        break;
                }
                this._daytimeString = 'Tonight';
            }
        }

        return this._daytimeString;
    }

    private _nextTimeEnd: DateTime | null = null;
    get nextTimeEnd(): DateTime | null {
        if (isNil(this._nextTimeEnd)) {
            this._nextTimeEnd = <any>this.nextTime?.plus({ minutes: this.duration });
        }
        return this._nextTimeEnd;
    }

    // Determine the next DateTime that this meeting occurs
    // returned DateTime will be in local timezone
    private _nextTime: DateTime | null = null;
    get nextTime(): DateTime {
        if (isNil(this._nextTime)) {
            // Weekly meetings use startDateTime to compare with now
            // const now = MeetingUtil.makeThat70sDateTime() as any;
            const startDateTime = DateTime.fromMillis(this.startDateTime);

            let next = DateTime.now().set({
                hour: startDateTime.hour,
                minute: startDateTime.minute,
                weekday: startDateTime.weekday as any,
            });

            if (next < DateTime.now()) next = next.plus({ weeks: 1 });
            this._nextTime = next;
        }

        return <any>this._nextTime;
    }

    private _startTimeFormat?: string | null = null;
    get startTimeFormat(): string | null {
        if (isNil(this._startTimeFormat)) {
            this._startTimeFormat = this.tConvert(
                this.startTimeFormatLocal?.toFormat('HH:mm a')
            );
        }
        return <any>this._startTimeFormat;
    }

    private _startTimeFormatLocal?: DateTime | null = null;
    get startTimeFormatLocal(): DateTime | null {
        if (isNil(this._startTimeFormatLocal)) {
            try {
                const start = DateTime.fromObject(
                    {
                        hour: Number.parseInt(this.time24h?.split(':')[0]),
                        minute: Number.parseInt(this.time24h?.split(':')[1]),
                    },
                    { zone: this.timezone }
                ).setZone('local');
                this._startTimeFormatLocal = start;
            } catch (error) {
                // console.error(error);
                // TODO
                // return;
                this._startTimeFormatLocal = <any>null;
            }
        }
        return <any>this._startTimeFormatLocal;
    }

    get meetingTypesString(): string {
        return join([this.groupType, ...this.meetingTypes], ' ').toUpperCase();
    }

    get tagsString(): string {
        return join(this.tags, ',').toLowerCase();
    }

    // Meeting ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
    // get weekday(): number {
    //     // @ts-ignore
    //     return MeetingUtil.iso_weekday_2_70s_dow[this.recurrence!.weekly_day];
    // }

    // constructor() {
    // }

    // public computeHash(): string {
    //     const input = `${this.meetingTypes.join()}${this.meetingUrl}${this.name}${this.description}
    //         ${this.password}${this._passwordEnc}${this.language}${this.location}${this.duration}
    //         ${this.time24h}${this.timezone}${this.closed}${this.restricted}${this.restrictedDescription}
    //         ${this.requiresLogin}${this.tags}${this.continuous}${this.zid}`;

    //     return CryptoJS.MD5(input).toString();
    // }

    public setVerification(status: string) {
        switch (status) {
            case 'success':
                this.verified = true;
                this.verified_status = VerifiedStatus.SUCCESS;
                break;
            case 'empty':
                this.verified = false;
                this.verified_status = VerifiedStatus.EMPTY;
                break;
            case 'fail':
            case 'quick-fail':
                if (!this.verified) {
                    // disable unverified meetings that fail
                    this.active = false;
                }
                this.verified = false;
                this.verified_status = VerifiedStatus.FAILED;
                break;
            case 'waiting-room':
                this.verified = false;
                this.verified_status = VerifiedStatus.WAITING;
                break;
            case 'password':
                if (isEmpty(this.password) && isEmpty(this._passwordEnc)) {
                    // disable password meetings if we have no password
                    this.active = false;
                }
                this.verified = false;
                this.verified_status = VerifiedStatus.PASSWORD;
                break;
            default:
                this.verified = false;
                this.verified_status = VerifiedStatus.NONE;
                break;
        }

        this.updated = this.verified_date = DateTime.now().toMillis();
    }

    // refresh() {
    //     this._tminus = null;
    //     this._endsIn = null;
    //     this._isLive = null;
    //     this._nextTime = null;
    //     this._nextTimeEnd = null;
    //     this._startTimeFormat = null;
    //     this._startTimeFormatLocal = null;
    //     this._startTimeString = null;
    //     this._daytimeString = null;
    // }

    public isLiveAt(dateTime: DateTime): boolean {
        // TODO Review (seems wacky)
        dateTime = MeetingUtil.makeThat70sTime(dateTime); // put required local time: dateTime into That70sTime
        let isLive = false;
        const _dateTime = MeetingUtil.makeThat70sDateTime(dateTime).toMillis();
        isLive =
            this.continuous ||
            (this.startDateTime <= _dateTime &&
                _dateTime <= this.startDateTime + this.duration * 60 * 1000); // start <= now <= end

        return isLive;
    }

    // ISO specifies the dow ordering and numbering as
    // see https://en.wikipedia.org/wiki/ISO_week_date
    // Properties names are WeekdayLong or ISO numeric string index
    // Property values are the corresponding 70's DayOfWeek
    static iso_weekday_2_70s_dow = {
        Monday: 5,
        '1': 5,
        Tuesday: 6,
        '2': 6,
        Wednesday: 7,
        '3': 7,
        Thursday: 1,
        '4': 1,
        Friday: 2,
        '5': 2,
        Saturday: 3,
        '6': 3,
        Sunday: 4,
        '7': 4,
    };

    /*
          Converts weekday dates for week of 1/1/1970 into iso weekday indexes
          ie  1/1/1970 is a Thursday which is iso day of week 4
              1/7/1970 is a Wednesday which is iso day of week 3
      */
    static _70s_dow_2_iso_weekday = {
        Thursday: 4,
        '1': 4,
        Friday: 5,
        '2': 5,
        Saturday: 6,
        '3': 6,
        Sunday: 7,
        '4': 7,
        Monday: 1,
        '5': 1,
        Tuesday: 2,
        '6': 2,
        Wednesday: 3,
        '7': 3,
    };

    // Monday = 1
    public static get today_weekdayLong(): string {
        // @ts-ignore
        return MeetingUtil.weekdays[DateTime.local().weekday];
    }

    static weekdays = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];

    // static iso_weekday_2_iso_index(weekday: any) { return MeetingUtil.weekdays.indexOf(weekday) + 1 }
    static oneDayMillis = 86400000; // 24 * 60 * 60 * 1000
    static oneWeekMillis = 7 * MeetingUtil.oneDayMillis;
    static time12to24h = (time12: any) =>
        new Date(`1970-01-01 ${time12}`)
            .toLocaleTimeString('en-US', { hour12: false })
            .substring(0, 5);

    // this function takes a starting millis and a frequency.
    // The mills for with the next frequency will happen is calculated
    //
    static getNextFrequency = (fromWhen: number, frequency: number): number => {
        // mark 1 would be every minute.  5 ever 5m and so on.

        let next = DateTime.fromMillis(fromWhen)
            .startOf('minute')
            .plus({ minutes: 1 }); // strips millis / seconds and advance to the next minute

        // advance next by one minute while minutes are not evenly divisible by _mark
        while (next.minute % frequency !== 0) next = next.plus({ minutes: 1 });

        // we have advanced next to the time of the next mark on the clock, return the difference in millis
        return next.toMillis();
    };

    public activate(activate: boolean): void {
        this.active = activate;
        this.updated = DateTime.now().toMillis();
    }

    // public update(): Meeting {
    //     this.updateProperties();
    //     this.updateDayTime();

    //     const hash = this.computeHash(); // compute hash
    //     if (hash !== this.hash) {
    //         // has anything non meta changed?
    //         this.hash = hash;
    //         this.updated = DateTime.now().toMillis(); // set new updated
    //     }

    //     return this;
    // }

    public updateProperties() {
        // remove ' ' and '-' from zid
        this.zid = this.zid.replace(/\s/g, '').replace('-', '');

        if (this.meetingTypes.find((mt) => mt === '24/7')) this.continuous = true;
        if (this.meetingTypes.find((mt) => mt === 'C')) this.closed = true;

        if (this.meetingTypes.find((mt) => mt === 'M')) {
            this.restricted = true;
            this.restrictedDescription = 'Male Only';
        }

        if (this.meetingTypes.find((mt) => mt === 'W')) {
            this.restricted = true;
            this.restrictedDescription = 'Female Only';
        }
    }

    public updateDayTime() {
        try {
            if (this.continuous) {
                this.startDateTime = -1;
                this.endDateTime = -1;
                this.time24h = '00:00';
            } else {
                // @ts-ignore
                this.startDateTime = <any>(
                    MeetingUtil.makeFrom24h_That70sDateTime(
                        this.time24h,
                        this.timezone,
                        this.dayOfWeek
                    )?.toMillis()
                );
                this.endDateTime = this.startDateTime + this.duration * 60 * 1000;
            }

            // Did endDateTime roll past Jan 7th?
            if (this.endDateTime > MeetingUtil.oneWeekMillis) {
                this.endDateTime = this.endDateTime - MeetingUtil.oneWeekMillis;
            }
        } catch (error) { }
    }

    /*
          parameters
          time:   may be a 24h 'hh:mm' string
                  may be a ISO string
                  may be milliseconds
                  may be a DateTime
  
          timezone: timezone of returned DateTime
  
          function returns a DateTime constructed from time with date set to 1/1/1970 in UTC
      */
    static makeThat70sTime(
        time?: any,
        timezone?: string,
        utc?: boolean
    ): DateTime {
        time = time || DateTime.local();
        if (!isNil(time)) {
            switch (typeof time) {
                case 'string': // 'hh:mm' or ISO string
                    time =
                        time.length !== 'hh:mm'.length
                            ? DateTime.fromISO(time)
                            : MeetingUtil.makeFrom24h_That70sDateTime(
                                time,
                                timezone as any,
                                'Thursday',
                                utc
                            );
                    break;
                case 'number':
                    time = MeetingUtil.makeThat70sDateTime(DateTime.fromMillis(time));
                    break;
                case 'object':
                    time = MeetingUtil.makeThat70sDateTime(
                        time,
                        MeetingUtil.iso_weekday_2_70s_dow.Thursday,
                        utc
                    );
                    break;
                default:
            }
        }
        return time;
    }

    static makeThat70sDateTime(
        dateTime?: DateTime,
        isoWeekday?: number,
        utc?: boolean
    ): DateTime {
        const dt = isNil(dateTime) ? DateTime.local() : dateTime;

        // @ts-ignore
        const day: any = isoWeekday || MeetingUtil.iso_weekday_2_70s_dow[dt.weekday.toString()];

        let _dateTime = DateTime.fromObject(
            {
                hour: dt.hour ? dt.hour : 0,
                minute: dt.minute ? dt.minute : 0,
                second: 0,
                millisecond: 0,
            },
            { zone: dt.zoneName ? dt.zoneName : 'local' }
        ).set({
            year: 1970,
            month: 1,
            day,
        });

        if (utc) _dateTime = _dateTime.setZone('UTC');
        return _dateTime;
    }

    static makeFrom24h_That70sDateTime(
        time24h: string,
        zone: string,
        weekday: string,
        utc?: boolean
    ): DateTime {
        const hour = Number.parseInt(time24h.split(':')[0]);
        const minute = Number.parseInt(time24h.split(':')[1]);
        // @ts-ignore
        const day: any = MeetingUtil.iso_weekday_2_70s_dow[weekday];

        let dateTime = DateTime.fromObject(
            {
                hour,
                minute,
                second: 0,
                millisecond: 0,
            },
            { zone }
        ).set({
            year: 1970,
            month: 1,
            day,
        });

        if (utc) dateTime = dateTime.setZone('UTC');
        return dateTime;
    }

    // Move this search into the appropriate specific weekday of 1/1/1970
    static makeThat70sWeekday(
        start: DateTime,
        end: DateTime,
        weekday: any
    ): { start: DateTime; end: DateTime; _start: string; _end: string } {
        // get weekday to move this search to
        weekday =
            weekday !== SpecificDay.today ? weekday : DateTime.local().weekday;

        // midnight indicates start happens on previous day
        const midnight = start.weekday !== end.weekday;

        // align weekday into 70's dow
        // @ts-ignore
        weekday = MeetingUtil.iso_weekday_2_70s_dow[weekday];

        // save original size of window
        // here is the bug!  (diff < 0) === true!
        // const diff = end.diff(start);   // save start-end diff so we know where to put end (if on a different day)

        // TODO MIDNIGHT-BUG chased damn midnight bug to here and then the clock struck 1 and it's gone
        // was a good one too....was on the Wed/Thu DateTime split too.
        // fix tomorrow night....

        // start weekday - if midnight and weekday is the 1st, roll weekday to 7th otherwise day before weekday
        const _startWeekday = !midnight ? weekday : weekday === 1 ? 7 : weekday - 1;

        const _start: DateTime = start.set({ day: _startWeekday }); // set new start weekday
        const _end: DateTime = end.set({ day: weekday }); // adjust end to new start
        return {
            start: _start,
            end: _end,
            // DEBUG data
            _start: _start.toLocaleString(DateTime.DATETIME_SHORT),
            _end: _end.toLocaleString(DateTime.DATETIME_SHORT),
        };
    }

    // https://stackoverflow.com/questions/13898423/javascript-convert-24-hour-time-of-day-string-to-12-hour-time-with-am-pm-and-no/13899011
    tConvert(time: any) {
        // update this to use luxon

        // Check correct time format and split into components
        let t = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)?$/) || [time];

        if (t.length > 1) {
            // If time format correct
            t = t.slice(1); // Remove full string match value
            t[5] = +t[0] < 12 ? ' am' : ' pm'; // Set AM/PM
            t[0] = +t[0] % 12 || 12; // Adjust hours
        }
        return t.join(''); // return adjusted time or original string
    }
}