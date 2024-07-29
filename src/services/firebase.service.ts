import { Injectable } from "@nestjs/common";
import { AndroidConfig, ApnsConfig } from "firebase-admin/lib/messaging/messaging-api";
import { PushNotificationDto } from "src/dto/firebase.dto";
const firebase = require("firebase-admin");
// const serviceAccount = require('../../firebase-config.json');
// firebase.initializeApp({ credential: firebase.credential.cert(serviceAccount) });

class MessageDto extends PushNotificationDto {
    token: string;
    android?: AndroidConfig;
    apns?: ApnsConfig;
}

@Injectable()
export class FirebaseService {  
    constructor() { }

    private async notification(message: MessageDto) {
        firebase.messaging().send(message).then((response: any) => {
            console.log("firebase response->", response)
        })
            .catch((error: any) => {
                console.log("firebase error->", error)
                // // Delete token for user if error code is UNREGISTERED or INVALID_ARGUMENT.
                // if (errorCode == "messaging/registration-token-not-registered") {
                //     // If you're running your own server, call API to delete the token for the user

                //     // Example shown below with Firestore
                //     // Get user ID from Firebase Auth or your own server
                //     Firebase.firestore.collection("fcmTokens").document(user.uid).delete()
                // }
            });
    }
    async sendPushNotification(deviceToken: any, notification: PushNotificationDto) {
        let message: MessageDto = {
            ...notification, token: deviceToken,
            android: { priority: 'high', notification: { sound: 'default' } },
            apns: { headers: { 'apns-priority': '10', }, payload: { aps: { sound: 'default' } } }
        }
        this.notification(message);
    }
}