import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
@Injectable()
export class SendMailService {
    constructor(private mailerService: MailerService) { }
    private async send(to: string | string[], subject: string, body: string, attachment: any[], bodyIsHtml: boolean = false) {
        let mailOption: any = {
            to: to,
            from: { name: 'True Trader', address: process.env.SMTP_USERNAME },
            subject: subject,
            attachments: attachment
        }
        if (bodyIsHtml)
            mailOption['html'] = body;
        else
            mailOption['text'] = body;
        await this.mailerService.sendMail(mailOption);
    }

    private getMailBody(otp: string) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
                body{
                    font-family: 'Poppins', sans-serif;
                    margin: 0px;
                }
            </style>
        </head>
        <body style="background: #ffff;font-weight: 300;color:#000">
            <div style="max-width:480px;margin:0px auto;">
                <div style="border-bottom:1px solid #000;display: inline-block;width: 100%;margin-bottom:16px;">
                    <img src="https://admin.access.truetraderapp.com/logo-black.png" alt="" style="max-width:200px;display: inline-block;">
                    <p style="font-weight:700;display: inline-block;width:100%;max-width: 270px;text-align:right">Password Assistance</p>
                </div>
                <p style="margin:0px;margin-bottom:24px;">To authenticate, please use the following One Time Password (OTP):</p>
                <p style="font-size:18px;font-weight:800;margin:0px;margin-bottom:24px;">${otp}</p>
                <p style="margin:0px;margin-bottom:16px;">Don't share this OTP with anyone. Our customer service team will never ask you for your OTP.</p>
                <p style="margin:0px;margin-bottom:16px;">We hope to see you again</p>
            </div>
        </body>
        </html>`
    }

    async sendOtp(to: string, otp: string) {
        const body = this.getMailBody(otp);
        this.send(to, "TrueTrader Login OTP", body, [], true);
    }

    async sendCommunicationEmail(to: string[], subject: string, body: string) {
        to.forEach((ele) => {
            this.send(ele, subject, body, [], true);
        })
    }
}