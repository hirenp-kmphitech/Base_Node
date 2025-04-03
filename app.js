const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

const appError = require('./utils/services/appError');
const errorMiddleware = require('./middleware/errorMiddleware');
const loggerMiddleware = require('./middleware/loggerMiddleware');

const commonConfig = require("./config/common.config");
global.basedir = __dirname;
global.APP_NAME = process.env.APPNAME || "Demo";
global.APP_URL = process.env.APPURL || "http://localhost:3013";
const corsOptions = {
    origin: global.APP_URL
};
const server = require('http').createServer(app);
const io = require("socket.io")(server);

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use('/public', express.static(`${__dirname}/public`));
// Middleware to log each request and response
app.use(loggerMiddleware);

// Handle undefined routes

// simple route
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Demo api." });
});

const request = require('request');
const AWS = require('aws-sdk');

const rekognition = new AWS.Rekognition({
    // Detect moderation labels is available on AWS region us-east-1, us-west-2 and eu-west-1
    region: commonConfig.AWS.REGION,
    accessKeyId: commonConfig.AWS.ACCESS_KEY,
    secretAccessKey: commonConfig.AWS.SECRET_KEY
});


async function moderateImage(imagePath) {
    const forbiddenLabels = [
        'Exposed Male Genitalia',
        'Exposed Female Genitalia',
        'Exposed Buttocks or Anus',
        'Exposed Female Nipple',
        'Bare Back',
        'Exposed Male Nipple',
        'Partially Exposed Buttocks',
        'Partially Exposed Female Breast',
        'Implied Nudity',
        'Weapon Violence',
        'Physical Violence',
        'Self-Harm',
        'Blood & Gore',
        'Explosions and Blasts',
        'Emaciated Bodies',
        'Corpses',
        'Air Crash',
        'Pills',
        'Request has invalid image format',
        'Unknown error'
    ];


    const params = {
        Image: {
            Bytes: imagePath,
        },
        MinConfidence: 70,
    };


    const promise = new Promise((resolve, reject) => {
        rekognition.detectModerationLabels(params, (err, data) => {
            if (err) {
                let errorMsg = err.message ?? "Unknown error";
                console.log('error-->>>', errorMsg);
                resolve([{ Name: errorMsg }]);
            } else {
                if (data) {
                    resolve(data.ModerationLabels);
                }
                else {
                    resolve([]);
                }
            }

        })
    })


    const ModerationLabels = await promise;
    // console.log('ModerationLabels-->>', ModerationLabels);

    // If no labels found -> image doesn't contain any forbidden content
    if (!ModerationLabels || ModerationLabels.length === 0) {
        return [];
    }
    // console.log('ModerationLabels->', ModerationLabels);


    // If some labels found -> compare them with forbidden labels
    const labels = ModerationLabels.map((label) => label.Name).filter(Boolean);
    // console.log('Found Labels:', JSON.stringify(labels));


    const foundForbiddenLabels = labels.filter((label) => forbiddenLabels.includes(label));
    // console.log('Found forbidden labels:', JSON.stringify(foundForbiddenLabels));
    return foundForbiddenLabels;

}

app.get("/checkImageModeration", (req, res) => {
    try {
        const url = req.query.imageurl;

        request({
            method: "GET",
            url: url,
            encoding: null
        }, async (err, response, body) => {
            if (err) {
                console.error('error first:', err);
                res.send({ result: false, data: err });
            }
            let imageResponse = await moderateImage(body);
            console.log('imageResponse-->>', imageResponse);
            let mod_res = false;
            if (imageResponse.length == 0) {
                mod_res = true;
            }
            res.send({ result: mod_res, data: imageResponse });

        });
    } catch (error) {
        res.send({ error: true, data: err })
    }

});

require('./models/db');
const { checkVersion } = require("./middleware/routeMiddleware");
// Global  version check
app.use(checkVersion);
require("./routes")(app);

const ApiResponse = require('./utils/services/ApiResponse');

// For 404 request handling
app.use((req, res, next) => {
    next(ApiResponse.notFound(`Cannot find ${req.originalUrl} on this server`));
});

// Global error handler
app.use(errorMiddleware);



// set port, listen for requests
const PORT = process.env.PORT || 3030;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});



const Messages = require("./models/Messages");

// const { verifySMSCode, sendSMS } = require("./utils/services/sendSMSVerifyV2");
// // Endpoint to send verification code
// app.post('/send-verification', async (req, res) => {
//     const { phoneNumber } = req.body;
//     try {
//         const verification = await sendSMS(phoneNumber);
//         res.status(200).send({ verification });
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });

// // Endpoint to verify the code
// app.post('/verify-code', async (req, res) => {
//     const { phoneNumber, code } = req.body;
//     try {
//         const verificationCheck = await verifySMSCode(phoneNumber, code);
//         if (verificationCheck.status === true) {
//             res.status(200).send({ message: 'Verification successful' });
//         } else {
//             res.status(400).send({ message: 'Invalid code' });
//         }
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });

app.get('/error', (req, res) => res.send("error logging in"));


app.get("/stripe_payment", (req, res) => {
    const { clientSecret } = req.query;
    const html = `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Woof3 Payment</title>
            <style>
                /* Variables */
                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    font-size: 16px;
                    -webkit-font-smoothing: antialiased;
                    display: flex;
                    justify-content: center;
                    align-content: center;
                    height: 100vh;
                    width: 100vw;
                }

                form {
                    width: 30vw;
                    min-width: 500px;
                    align-self: center;
                    box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
                    0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
                    border-radius: 7px;
                    padding: 40px;
                }

                .hidden {
                    display: none;
                }

                #payment-element {
                    margin-bottom: 24px;
                }

                /* Buttons and links */
                button {
                    background: #5469d4;
                    font-family: Arial, sans-serif;
                    color: #ffffff;
                    border-radius: 4px;
                    border: 0;
                    padding: 12px 16px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    display: block;
                    transition: all 0.2s ease;
                    box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
                    width: 100%;
                }
                button:hover {
                    filter: contrast(115%);
                }
                button:disabled {
                    opacity: 0.5;
                    cursor: default;
                }

                /* spinner/processing state, errors */
                .spinner,
                .spinner:before,
                .spinner:after {
                    border-radius: 50%;
                }
                .spinner {
                    color: #ffffff;
                    font-size: 22px;
                    text-indent: -99999px;
                    margin: 0px auto;
                    position: relative;
                    width: 20px;
                    height: 20px;
                    box-shadow: inset 0 0 0 2px;
                    -webkit-transform: translateZ(0);
                    -ms-transform: translateZ(0);
                    transform: translateZ(0);
                }
                .spinner:before,
                .spinner:after {
                    position: absolute;
                    content: "";
                }
                .spinner:before {
                    width: 10.4px;
                    height: 20.4px;
                    background: #5469d4;
                    border-radius: 20.4px 0 0 20.4px;
                    top: -0.2px;
                    left: -0.2px;
                    -webkit-transform-origin: 10.4px 10.2px;
                    transform-origin: 10.4px 10.2px;
                    -webkit-animation: loading 2s infinite ease 1.5s;
                    animation: loading 2s infinite ease 1.5s;
                }
                .spinner:after {
                    width: 10.4px;
                    height: 10.2px;
                    background: #5469d4;
                    border-radius: 0 10.2px 10.2px 0;
                    top: -0.1px;
                    left: 10.2px;
                    -webkit-transform-origin: 0px 10.2px;
                    transform-origin: 0px 10.2px;
                    -webkit-animation: loading 2s infinite ease;
                    animation: loading 2s infinite ease;
                }

                @-webkit-keyframes loading {
                    0% {
                        -webkit-transform: rotate(0deg);
                        transform: rotate(0deg);
                    }
                    100% {
                        -webkit-transform: rotate(360deg);
                        transform: rotate(360deg);
                    }
                }
                @keyframes loading {
                    0% {
                        -webkit-transform: rotate(0deg);
                        transform: rotate(0deg);
                    }
                    100% {
                        -webkit-transform: rotate(360deg);
                        transform: rotate(360deg);
                    }
                }

                @media only screen and (max-width: 600px) {
                    form {
                        width: 80vw;
                        min-width: initial;
                    }
                }
                #powered-by-stripe {
                    text-align: center;
                    color: #666;
                }
                #powered-by-stripe> p{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin:0 auto;
                    font-size: 20px;
                 }
            </style>
            <script src="https://js.stripe.com/v3/"></script>
            </head>
            <body>

           <form id="payment-form" class="dash_div " style="margin:0 auto">
                <center><h1>Woof3 Payment</h1></center>
                <div id="payment-element">
                    <!--Stripe.js injects the Payment Element-->
                </div>
                <button id="submit">
                    <div class="spinner hidden" id="spinner"></div>
                    <span id="button-text">Pay now </span>
                </button>
                <!-- Powered by Stripe badge -->
                <div id="powered-by-stripe">
                    <p>Powered by <img src="public/images/powerbystripe.png" alt="Stripe" width="20%"></p>
                </div>
            </form>

            <script type="text/javascript">
                // This is your test publishable API key.
                const stripe = Stripe("`+ commonConfig.STRIPE_PUBLIC_KEY + `");

                let elements;

                
                    document
                    .querySelector("#payment-form")
                    .addEventListener("submit", handleSubmit);
                

                let emailAddress = null;
                let returnUrl = "`+ global.APP_URL + `/success";
                console.log(returnUrl)
                // Fetches a payment intent and captures the client secret
                initialize('`+ clientSecret + `');
                async function initialize(clientSecret) {
                    elements = stripe.elements({ clientSecret });

                    // const linkAuthenticationElement = elements.create("linkAuthentication");
                    // linkAuthenticationElement.mount("#link-authentication-element");

                    const paymentElementOptions = {
                        layout: "tabs",
                    };

                    const paymentElement = elements.create("payment", paymentElementOptions);
                    paymentElement.mount("#payment-element");
                }

                async function handleSubmit(e) {
                    e.preventDefault();
                    setLoading(true);

                    const { error } = await stripe.confirmPayment({
                        elements,
                        confirmParams: {
                            // Make sure to change this to your payment completion page
                            return_url: returnUrl,
                            receipt_email: emailAddress,
                        },
                    });
                    console.log(error);

                    if (error.type === "card_error" || error.type === "validation_error") {
                        alert(error.message)
                    } else {
                        alert("An unexpected error occurred.")
                    }

                    setLoading(false);
                }

                // Fetches the payment intent status after payment submission
                async function retrievePayIntent() {
                    const clientSecret = new URLSearchParams(window.location.search).get(
                        "payment_intent_client_secret"
                    );

                    if (!clientSecret) {
                        return;
                    }

                    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
                    return paymentIntent;
                }

                // Show a spinner on payment submission
                function setLoading(isLoading) {
                    if (isLoading) {
                        // Disable the button and show a spinner
                        document.querySelector("#submit").disabled = true;
                        document.querySelector("#spinner").classList.remove("hidden");
                        document.querySelector("#button-text").classList.add("hidden");
                    } else {
                        document.querySelector("#submit").disabled = false;
                        document.querySelector("#spinner").classList.add("hidden");
                        document.querySelector("#button-text").classList.remove("hidden");
                    }
                }

            </script>


            </body>
            </html>

    `;

    res.send(html);
});

// Define a route for the success page
app.get('/success', (req, res) => {
    res.sendFile(__dirname + '/public/success.html');
});

app.post('/webhook_stripe', async (req, res) => {

    let event = req.body;
    console.log('stripe webhook event', event.type);
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object; // Contains a Stripe PaymentIntent
            console.log("Success-meta->>", paymentIntent.metadata);

            const { userId, plan_id, quantity } = paymentIntent.metadata;

            const plan = await MarketSpaceMaster.findById(plan_id);
            if (!plan) {
                console.log('plan not found:', plan_id);
                break;
            }
            // make payment
            const bonus = await BonusMaster.findOne({ reward_id: plan.reward_id });

            let userBonus = await UserBonusMaster.findOne({ userId, reward_id: plan.reward_id, bonus_type: bonus.bonus_type });
            if (userBonus) {
                await UserBonusMaster.findByIdAndUpdate(userBonus._id, { received: userBonus.received + Number(quantity) });
            } else {
                await UserBonusMaster.create({
                    userId, reward_id: plan.reward_id, bonus_type: bonus.bonus_type, received: Number(quantity)
                });
            }

            // manage bonus history
            await BonusHistoryMaster.create({
                userId,
                bonus: Number(quantity),
                bonus_type: bonus.bonus_type,
                reward_id: plan.reward_id,
                bonus_on: 'purchase_plan',
                date: moment().format('YYYY-MM-DD'),
                credit: true
            });
            res.send("payment success!");
            break;
        case 'payment_intent.payment_failed':
            const paymentFailedIntent = event.data.object; // Contains a Stripe PaymentIntent
            console.log("Failed-->>", paymentFailedIntent);
            res.send("payment failed!");
            break;
        // Add more event types as needed
        default:
            res.send("payment default!");
            console.log(`Unhandled event type: ${event.type}`);
    }
    res.send({});


});



// PAYPAL Configuration
// const paypalPaymentController = require('./controllers/paypalpaymentController');
const ResponseFormatter = require('./utils/helper/response-formatter');
const formatter = new ResponseFormatter();
// app.get('/pay', async (req, res) => {
//     let paymentURL = await paypalPaymentController.payViaPaypal(req.query.amount, req.query.desc);
//     console.log('paymentURL-->>', paymentURL);

//     res.redirect(paymentURL);
// });

// app.get('/success', async (req, res) => {
//     const payerId = req.query.PayerID;
//     const paymentId = req.query.paymentId;
//     const amount = req.query.amount;

//     const execute_payment_json = {
//         "payer_id": payerId,
//         "transactions": [{
//             "amount": {
//                 "currency": "USD",
//                 "total": amount
//             }
//         }]
//     };
//     let paymentData = await paypalPaymentController.paymentExecution(paymentId, execute_payment_json);
//     var message = '{"ResponseCode":0,"ResponseMsg":"Something went wrong, Please try again.","Result":"False"}';
//     if (paymentData && paymentData.id && paymentData.state == "approved") {
//         message = '{"ResponseCode":1,"ResponseMsg":"Payment Success.","Result":"True"}';
//     }
//     Print.postMessage(message);
//     res.send(paymentData);
// });

// app.get('/cancel', (req, res) => {
//     var message = '{"ResponseCode":0,"ResponseMsg":"Payment has been cancel,Please try again.","Result":"False"}';
//     Print.postMessage(message);
//     res.send({})
// });


// app.post('/payout', async (req, res) => {
//     const { email, amount } = req.body;
//     let apiResponse = await paypalPaymentController.payoutPaypalViaEmail(amount, email);
//     let formatResponse = formatter.formatResponse(apiResponse, 1, "payout_success", true);
//     res.send(formatResponse);
// });

// app.get('/refund/:paymentId', async (req, res) => {
//     const paymentId = req.params.paymentId;
//     let refundStatus = await paypalPaymentController.refundPayment(paymentId);
//     let formatResponse = formatter.formatResponse(refundStatus, 1, "refund_success", true);
//     res.send(formatResponse);
// });

// app.get('/payment-status/:paymentId', async (req, res) => {
//     const paymentId = req.params.paymentId;
//     let statusResponse = await paypalPaymentController.paypalPaymentStatusCheck(paymentId);
//     let formatResponse = formatter.formatResponse(statusResponse, 1, "get_detail_success", true);
//     res.send(formatResponse);
// });

// app.get('/payout-status/:payoutBatchId', async (req, res) => {
//     const payoutBatchId = req.params.payoutBatchId;
//     let statusResponse = await paypalPaymentController.paypalPayoutStatusCheck(payoutBatchId);
//     let formatResponse = formatter.formatResponse(statusResponse, 1, "get_detail_success", true);
//     res.send(formatResponse)

// });
// Over Paypal API


// for chat
async function saveMessage(socket, message, senderId, receiverId, messageType, CreatedAt) {
    try {

        let newMsg = Messages();
        newMsg.msg = message;
        newMsg.senderId = senderId;
        newMsg.receiverId = receiverId;
        newMsg.createdAt = CreatedAt;
        newMsg.msgType = messageType;
        var result = await newMsg.save();

        var msgId = result._id;
        emitEventFromAPI(socket, msgId, receiverId);
    } catch (error) {
        let errorMsg = error.message ?? "Something went wrong";
        console.log('errorMsg-saveMessage->>', errorMsg);
        errorSocketEmit(socket, "setNewMessage", errorMsg);
    }

}

async function emitEventFromAPI(socket, msgId, receiverId) {
    try {
        var newMsg = await Messages.findById(msgId);
        if (newMsg.msgType == "image") {
            newMsg.msg = APP_URL + "/public/chat_img/" + newMsg.msg;
        }


        // set new user in list
        var chatList = newMsg;

        socket.to(receiverId.toString()).emit('setNewMessage', {
            resData: newMsg
        });


        if (chatList.msgType == "image") {
            chatList.msg = APP_URL + "/public/chat_img/" + chatList.msg;
        }

        if ((chatList._doc.receiverId._id).toString() == receiverId.toString()) {
            chatList._doc.user_detail = chatList.receiverId; delete chatList._doc.receiverId; delete chatList._doc.senderId;
        }
        else {
            chatList._doc.user_detail = chatList.senderId; delete chatList._doc.receiverId; delete chatList._doc.senderId;
        }
        chatList._doc.user_detail.profile = global.APP_URL + "/public/profile/" + chatList._doc.user_detail.profile;

        socket.to(receiverId.toString()).emit('updateChatList', {
            resData: chatList
        });

        /* let receiverToken = chatList._doc.user_detail.deviceToken ?? "";
        if (receiverToken && receiverToken != "") {
            let notiData = { notificationType: "message", type: "chat" }
            var notiMsg = newMsg.msg;
            if (chatList.msgType == "image") {
                notiMsg = "Image";
            }
            await sendFirebaseNotifcation(receiverToken, global.APP_NAME, notiMsg, notiData);
        } */
        // over new user set


    } catch (error) {
        let errorMsg = error.message ?? "Somethig went wrong";
        console.log('errorMsg-emitevent->>', errorMsg);
        errorSocketEmit(socket, "setNewMessage", errorMsg);
    }

}


io.on('connection', (socket) => {
    console.log("socket connected");

    socket.on('socketJoin', (userId) => {
        if (!socket.rooms.has(userId.toString())) {
            console.log('roomJoin-->>>', userId);
            socket.join(userId.toString());
        }
    });

    socket.on('socketLeave', (userId) => {
        if (socket.rooms.has(userId.toString())) {
            console.log('roomLeave-->>>', userId);
            socket.leave(userId.toString());
        }
    });

    socket.on('getChatUserlist', async (loginId) => {
        try {
            const jsonObj = { loginId };
            if (!checkJsonParam(jsonObj, ['loginId'], socket, 'setChatUserlist')) {
                return;
            }
            else {
                if (!socket.rooms.hasOwnProperty(loginId.toString())) {
                    socket.join(loginId.toString());
                }

                let filter = { $or: [{ senderId: loginId }, { receiverId: loginId }] };
                var result = await Messages.list(filter, "msg msgType updatedAt", { _id: -1 });

                var uniqUsers = result.filter((obj, index) => {
                    let getIndex = -1;
                    if ((obj._doc.senderId._id).toString() == loginId.toString()) {
                        getIndex = result.findIndex(o => (obj._doc.receiverId._id).toString() == (o._doc.receiverId._id).toString())
                    }
                    else {
                        getIndex = result.findIndex(o => (obj._doc.senderId._id).toString() == (o._doc.senderId._id).toString())
                    }

                    return index === getIndex;
                })

                var chatList = uniqUsers;
                chatList = chatList.map((data) => {
                    if (data.senderId._id == loginId) {
                        data._doc.user_detail = data.receiverId; delete data._doc.receiverId; delete data._doc.senderId;
                    }
                    else {
                        data._doc.user_detail = data.senderId; delete data._doc.receiverId; delete data._doc.senderId;
                    }

                    if (data.msgType == "image") {
                        data._doc.msg = global.APP_URL + "/public/chat_img/" + data._doc.msg;
                    }
                    data._doc.user_detail.profile = global.APP_URL + "/public/profile/" + data._doc.user_detail.profile;
                    return data;
                });
                chatList = chatList.filter((obj, index) => {
                    return index === chatList.findIndex(o => (obj._doc.user_detail._id).toString() == (o._doc.user_detail._id).toString());
                });

                socket.emit('setChatUserlist', {
                    resData: chatList
                });

            }
        } catch (error) {
            let errorMsg = error.message ?? "Somethig went wrong";
            console.log('errorMsg-setChatUserlist->>', errorMsg);
            errorSocketEmit(socket, "setChatUserlist", errorMsg);
        }

    });


    socket.on('getMessageList', async (loginId, receiverId) => {
        try {
            const jsonObj = { loginId, receiverId };
            if (!checkJsonParam(jsonObj, ['loginId', 'receiverId'], socket, 'setMessageList')) {
                return;
            }
            else {

                let filter = { $or: [{ $and: [{ senderId: loginId }, { receiverId: receiverId }] }, { $and: [{ senderId: receiverId }, { receiverId: loginId }] }] };
                var result = await Messages.list(filter, "msg msgType");

                var MsgList = result.map((data) => {
                    if (data.msgType == "image") {
                        data._doc.msg = APP_URL + "/public/chat_img/" + data.msg;
                    }
                    return data;
                });

                socket.emit('setMessageList', {
                    resData: MsgList
                });

            }
        } catch (error) {
            let errorMsg = error.message ?? "Somethig went wrong";
            console.log('errorMsg-setMessageList->>', errorMsg);
            errorSocketEmit(socket, "setMessageList", errorMsg);
        }
    });


    socket.on('sendMessage', async (data, senderId, receiverId, messageType, CreatedAt) => {
        try {
            const jsonObj = { data, senderId, receiverId, messageType, CreatedAt };
            if (!checkJsonParam(jsonObj, ['data', 'senderId', 'receiverId', 'messageType', 'CreatedAt'], socket, 'setNewMessage')) {
                return;
            }
            else {
                // console.log('jsonObj =======>',jsonObj);
                var message = "";
                if (messageType == 'image') {
                    message = data;
                    saveMessage(socket, message, senderId, receiverId, messageType, CreatedAt);
                }
                else {
                    message = data;
                    saveMessage(socket, message, senderId, receiverId, messageType, CreatedAt);
                }

            }
        } catch (error) {
            let errorMsg = error.message ?? "Somethig went wrong";
            console.log('errorMsg-setNewMessage->>', errorMsg);
            errorSocketEmit(socket, "setNewMessage", errorMsg);
        }
    });


    // when the user disconnects.. perform this
    socket.on('disconnect', () => {
        console.log("socket disconnected");
    });


});

function checkJsonParam(jsonObj, check_keys, socket, socketEvent) {

    var is_valid = true;
    var missing_parameter = "";

    check_keys.forEach(function (key, indexOf) {
        if (!jsonObj.hasOwnProperty(key) || jsonObj[key] == "" || jsonObj[key] == undefined) {
            is_valid = false;
            missing_parameter += key + " ";
        }
    });
    if (!is_valid) {
        errorSocketEmit(socket, socketEvent, "Missing parameter  :" + missing_parameter);
    }
    return is_valid;

}

function errorSocketEmit(socket, socketEvent, errorMsg) {
    let response = { "success": 0, "Message": errorMsg, resData: {} };
    socket.emit(socketEvent, response);
}


// video uploading
const multer = require("multer");
const fs = require("fs");
const { uploadSingleVideo } = require("./utils/videoProcessor");
//multer middleware
//Configuration for Multer
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {

        if (!fs.existsSync('public/testvideo')) {
            fs.mkdirSync('public/testvideo');
        }
        cb(null, "public/testvideo");


    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `video_${Date.now()}.${ext}`);
    },
});
const upload = multer({ storage: multerStorage });

app.post("/upload", upload.single('file'), async function (req, res) {
    const videoName = "testvideo/testnew"
    const videoUrl = await uploadSingleVideo(req.file.path, videoName);

    res.json({
        message: "Video converted to HLS format",
        videoUrl: videoUrl,
        videoName: videoName
    })
})
