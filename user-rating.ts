import { DateTime } from 'luxon';
import { IUserStats } from './user.class';

export enum UserRatingStatus {
    NONE = '',
    NO_THANKS = `No, Thanks`,
    REMIND_ME_LATER = `Remind Me Later`,
    RATE_IT_NOW = `Rate It Now`,
    FEEDBACK = 'Feedback',
    FEEDBACK_DECLINE = 'Feedback Declined'
}

export interface IUserRating {
    uid: string;                    // user id
    enjoy: boolean;                 // is user enjoying the app?
    rate: boolean;                  // does user want to rate the app?
    remind: boolean;                // if not, does user want a reminder?
    feedback: boolean;              // doesn't enjoy, provided feedback?
    status: UserRatingStatus;       // verbal description of above flags
    stats: IUserStats;              // UserStats at the time of rating prompt
    timestamp: number;              // utc millis
}

export class UserRating implements IUserRating {
    uid = '';
    enjoy = false;
    rate = false;
    remind = false;
    feedback = false;
    status = UserRatingStatus.NONE;
    stats = <any>null;
    timestamp: number = DateTime.now().toMillis();

    constructor(userRating?: any) {
    }
}