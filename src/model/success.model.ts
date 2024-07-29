export class SuccessResponse<T> {
    success: boolean = true;
    message: string;
    data: T;

    constructor(message: string, data: T = null) {
        this.message = message;
        this.data = data;
    }
}