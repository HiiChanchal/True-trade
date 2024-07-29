import { Injectable } from "@nestjs/common";

@Injectable()
export class UtilityService {
    static getOrderNumber(refno: string, count: number) {
        // let _y = new Date().getFullYear().toString();
        // let _m = String(new Date().getMonth()).padStart(2, "0");
        // let _d = String(new Date().getDate()).padStart(2, "0");
        // let _hh = String(new Date().getHours()).padStart(2, "0");
        // let _mm = String(new Date().getMinutes()).padStart(2, "0");
        // let _ss = String(new Date().getSeconds()).padStart(2, "0");
        // let _sss = String(new Date().getMilliseconds()).padStart(3, "0");
        return `${refno}-${String(count + 1).padStart(4, "0")}`;

    }
    static groupBy(array: any[], key: any) {
        return array.reduce(function (rv, x) {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }
    static randomString(length: any, numeric: boolean = true, lower: boolean = true, upper: boolean = false) {
        const _lower = 'abcdefghijklmnopqrstuvwxyz';
        const _upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const _number = '0123456789';
        const _character = `${lower ? _lower : ''}${upper ? _upper : ''}${numeric ? _number : ''}`;
        const charactersLength = _character.length;
        let result: string[] = [];
        for (let i = 0; i < length; i++) {
            result.push(_character.charAt(Math.floor(Math.random() * charactersLength)));
        }
        return result.join('');
    }
    static guid(): string {
        return `${this.randomString(8)}-${this.randomString(4)}-${this.randomString(4)}-${this.randomString(4)}-${this.randomString(12)}`;
    }
    static verificationCode(): string {
        return this.randomString(4, true, false, false);
    }
    static getSlug(title: string): string {
        return title.trim().toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    }
    static inquiryTicketNumber() {
        return this.randomString(16);
    }
}