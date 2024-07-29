import { Injectable } from "@nestjs/common";
import { ProfileStatusEnum } from "src/enum/role.enum";
import { utils, write } from "xlsx";

@Injectable()
export class DownloadService {
    static statics(userStatics: any, categoryStatics: any[]) {
        let _user: any[] = [
            { Type: "Total Users", Count: userStatics.total },
            { Type: "Active Users", Count: userStatics.activeTrader + userStatics.activeProvider },
            { Type: "Traders ", Count: userStatics.trader + userStatics.both },
            { Type: "Signal providers", Count: userStatics.provider + userStatics.both },
            { Type: "Active Traders ", Count: userStatics.activeTrader },
            { Type: "Active Signal providers", Count: userStatics.activeProvider },
            { Type: "Daily New Users", Count: userStatics.daily },
            { Type: "Weekly New Users", Count: userStatics.weekly },
            { Type: "Monthly New Users", Count: userStatics.monthly },
            { Type: "Yearly New Users", Count: userStatics.yearly }
        ];
        let _category: any[] = [];
        categoryStatics.forEach((ele) => {
            _category.push({
                Category: ele.name,
                "All Signal": ele.signal?.total,
                "Active Signal": ele.signal?.open,
                "Close Signal": ele.signal?.closed,
                "Wins": ele.signal?.win,
                "Loses": ele.signal?.loss,
            })
        });
        const userSheet = utils.json_to_sheet(_user);
        const categorySheet = utils.json_to_sheet(_category);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, userSheet, "Users Statistics");
        utils.book_append_sheet(wb, categorySheet, "Category Statistics");
        return write(wb, { type: "buffer" });
    }
    static traders(traders: any[]) {
        let _traders: any[] = [];
        traders.forEach((ele) => {
            _traders.push({
                "Full Name": ele.trader.firstName,
                "Email": ele.trader.email,
                "Username": ele.trader.username,
                "Fund Balance": ele.trader.wallet,
                "Subscription": ele.trader.subscription?.category?.join(', '),
                "Following": ele.trader.subscription?.following,
                "Monthly Spending": ele.trader.subscription?.cost,
            })
        });
        const traderSheet = utils.json_to_sheet(_traders);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, traderSheet, "Traders");
        return write(wb, { type: "buffer" });
    }
    static providers(providers: any[]) {
        let _providers: any[] = [];
        providers.forEach((ele) => {
            _providers.push({
                "Full Name": ele.provider.firstName,
                "Email": ele.provider.email,
                "Username": ele.provider.username,
                "Total Earning": ele.provider.wallet,
                "Services": ele.provider.service?.join(', '),
                "Success Rate": ele.provider.signal ? `${ele.provider.signal.win}/${ele.provider.signal.loss}` : '',
                "Subscribers": ele.provider.subscription,
                "Available to Withdraw": ele.provider.wallet - ele.provider.withdraw,
            })
        });
        const providerSheet = utils.json_to_sheet(_providers);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, providerSheet, "Providers");
        return write(wb, { type: "buffer" });
    }
    static providersForVerification(providers: any[], status: string) {
        let _providers: any[] = [];
        providers.forEach((ele) => {
            _providers.push({
                "Full Name": ele.provider.firstName,
                "Email": ele.provider.email,
                "Username": ele.provider.username,
                "status": ele.provider.status
            })
        });
        const providerSheet = utils.json_to_sheet(_providers);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, providerSheet, status == ProfileStatusEnum.APPROVED ? "Requested Providers" : "Approved Providers");
        return write(wb, { type: "buffer" });
    }
    static chat(chat: any[]) {
        let _chat: any[] = [];
        chat.forEach((ele) => {
            _chat.push({
                "Tickets": ele.title,
                "User": ele.user.firstName,
                "Category": ele.type,
                "Date": ele.createdAt,
                "Status": ele.status
            })
        });
        const chatSheet = utils.json_to_sheet(_chat);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, chatSheet, "Chats");
        return write(wb, { type: "buffer" });
    }
    static chatHistory(history: any) {
        let _chat: any[] = [{
            "Tickets": history.title,
            "User": history.thread[0].user.firstName,
            "Category": history.type,
            "Date": history.createdAt,
            "Status": history.status
        }];
        let _threads: any[] = [];
        history.thread.forEach((ele) => {
            _threads.push({
                "text": ele.text,
                "User": ele.user?.firstName,
                "support": ele.support?.firstName,
                "Date": ele.createdAt
            })
        });
        const chatSheet = utils.json_to_sheet(_chat);
        const threadSheet = utils.json_to_sheet(_threads);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, chatSheet, "Chats");
        utils.book_append_sheet(wb, threadSheet, "Chat threads");
        return write(wb, { type: "buffer" });
    }

    static communication(communication: any[]) {
        let _communication: any[] = [];
        communication.forEach((ele) => {
            _communication.push({
                "Type": ele.type,
                "Platform": ele.platform.join(','),
                "Category": ele.category,
                "Title": ele.title,
                "Body": ele.body,
                "Click": ele.click
            })
        });
        const chatSheet = utils.json_to_sheet(_communication);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, chatSheet, "Communication");
        return write(wb, { type: "buffer" });
    }

    static depositTransaction(txn:any[]){
        let _txn: any[] = [];
        txn.forEach((e)=>{
            _txn.push({
             "Name": e.user?.firstName + e?.lastName,
             "username": e.user?.username,
             "Date": new Date(e.createdAt).toLocaleString(),
             "Payment Method":e.data.title,
             "UPI ID":e.data.upiId,
             "Account Holder Name": e.data.accountHolderName,
             "Bank Name":e.data.bankName,
             "Account Number":e.data.accountNumber,
             "IFSC Code":e.data.ifscCode,
             "Phone Number":e.data.phoneNumber,
             "Transaction Id":e.paymentTransactionId,
             "Status": e.status,
             "Deposit Amount": e.amount
            })
        });
        return _txn
        const txnSheet = utils.json_to_sheet(_txn);
        const wb =utils.book_new();
        utils.book_append_sheet(wb,txnSheet,"Deposit Transaction");
        return write(wb,{type:"buffer"});

    }
    static withdrawTransaction(txn:any[]){
        let _txn: any[] = [];
        txn.forEach((e)=>{
            _txn.push({
             "Name": e.user?.firstName + e?.lastName,
             "Current Balance":e.user?.traderWallet,
             "username": e.user?.username,
             "Date": new Date(e.createdAt).toLocaleString(),
             "Payment Method":e.data?.title,
             "UPI ID":e.data?.upiId,
             "Account Holder Name": e.data?.accountHolderName,
             "Bank Name":e.data?.bankName,
             "Account Number":e.data?.accountNumber,
             "IFSC Code":e.data?.ifscCode,
             "Phone Number":e.data?.phoneNumber,
             "Transaction Id":e.paymentTransactionId,
             "Status": e.status,
             "Deposit Amount": e.amount
            })
        });
        return _txn
        const txnSheet = utils.json_to_sheet(_txn);
        const wb =utils.book_new();
        utils.book_append_sheet(wb,txnSheet,"Deposit Transaction");
        return write(wb,{type:"buffer"});

    }
}