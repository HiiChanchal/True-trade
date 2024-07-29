export enum TransactionTypeEnum {
    DEBIT = 'Debit',//goes out
    CREDIT = 'Credit'//comes in
}

export enum TransactionForTypeEnum {
    SUBSCRIBE = 'Subscribe',
    DEPOSIT = 'Deposit',
    WITHDRAW = 'Withdraw'
}
export enum TransactionStatusEnum {
    INITIATED = 'Initiated',
    ACCEPTED = 'Accepted',
    REJECTED = 'Rejected',
    CANCELED = 'Canceled'
}