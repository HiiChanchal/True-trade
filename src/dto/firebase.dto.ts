export class PushNotificationDto {
    notification: {
        title: string;
        body: string;
    };
    data?: any;
}
