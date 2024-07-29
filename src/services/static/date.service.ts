import { Injectable } from "@nestjs/common";

@Injectable()
export class DateService {
    static getDateDayStart(date: Date, timezone: number) {
        const _timezoneDiff = (new Date().getTimezoneOffset()) - timezone;
        date.setHours(0, 0, 0, 0);
        if (_timezoneDiff != 0) {
            date.setHours(date.getHours() - Math.floor(_timezoneDiff / 60));
            date.setMinutes(date.getMinutes() - (_timezoneDiff % 60));
        }
        return date;
    }
    static getDateDayEnd(date: Date, timezone: number) {
        const _timezoneDiff = (new Date().getTimezoneOffset()) - timezone;
        date.setHours(23, 59, 59, 999);
        if (_timezoneDiff != 0) {
            date.setHours(date.getHours() - Math.floor(_timezoneDiff / 60));
            date.setMinutes(date.getMinutes() - (_timezoneDiff % 60));
        }
        return date;
    }
    static getDateByTimezone(timezone: number) {
        let _date = new Date();
        const _timezoneDiff = (_date.getTimezoneOffset()) - timezone;
        if (_timezoneDiff != 0) {
            _date.setHours(_date.getHours() - Math.floor(_timezoneDiff / 60));
            _date.setMinutes(_date.getMinutes() - (_timezoneDiff % 60));
        }
        return _date;
    }
}