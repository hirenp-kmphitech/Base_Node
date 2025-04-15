var firebase = require('firebase-admin');
var serviceAccount = require('./firebase_config.json'); // put service account file path
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
})
async function sendFirebaseNotification(deviceToken, title, body, data = {}) {

    var message = {
        token: deviceToken,
        // registration_ids: deviceToken, // Multiple tokens in an array
        notification: {
            title: title,
            body: body
        },
        data: data,
        android: {
            notification: {
                sound: 'default',
                channel_id: 'default',
            },
        },
        apns: {
            payload: {
                aps: {
                    sound: 'default',
                },
            },
        },
    };
    try {
        var response = await firebase.messaging().send(message);
        console.log('notification response-->>>', response);
    } catch (error) {
        console.log('notification error-->>>', error);
    }

}
module.exports = { sendFirebaseNotification }