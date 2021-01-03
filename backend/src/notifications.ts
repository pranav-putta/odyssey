import { String } from "aws-sdk/clients/cloudsearchdomain";
import admin from "firebase-admin";

interface Notification {
  BillInfo: {
    Number: number;
    Assembly: number;
    Chamber: string;
    URL: string;
  };
  Text: String;
}

export const send_notifications = async (event: any = {}): Promise<any> => {
  let data = JSON.parse(event.body);
  let notifications: Notification[] = data.notifications;

  notifications.forEach((notification) => {
    let bill = notification.BillInfo;
    let id = bill.Assembly + bill.Chamber + bill.Number;

    admin.messaging().send({
      topic: id,
      data: {
        messageType: "card",
        content: JSON.stringify({
          title: "Bill Update",
          body: notification.Text,
        }),
      },
    });
  });

  return { statusCode: 200, body: JSON.stringify({}) };
};
