const paypalPaymentController = {};
const config = require('../config/common.config');
const paypal = require('../utils/paypal'); // Import the configured PayPal SDK
/** APIs */


paypalPaymentController.payViaPaypal = async function (amount, desc = 'This is testing payment GIG') {
    try {
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": global.APP_URL + "/success?amount=" + amount,
                "cancel_url": global.APP_URL + "/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "GIG APP",
                        "price": amount,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": amount
                },
                "description": desc
            }]
        };
        let redirectURL = new Promise((resolve, reject) => {
            paypal.payment.create(create_payment_json, (error, payment) => {
                if (error) {
                    console.log("ERROR:" + error.response);
                    // throw error;
                    reject(error);
                } else {
                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            resolve(payment.links[i].href)
                        }
                    }
                }
            });

        });


        return redirectURL;

    } catch (err) {
        return err;
    }
}


paypalPaymentController.paymentExecution = async function (paymentId, execute_payment_json) {
    try {
        let response = new Promise((resolve, reject) => {
            paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
                if (error) {
                    console.log("ERROR:" + error.response);
                    // throw error;
                    reject(error);
                } else {

                    resolve(payment);
                }
            });
        });

        return response;

    } catch (err) {
        return err;
    }
}


paypalPaymentController.payoutPaypalViaEmail = async function (amount, email, description = "GIG service payout") {
    try {

        const sender_batch_id = Math.random().toString(36).substring(9);
        const create_payout_json = {
            "sender_batch_header": {
                "sender_batch_id": sender_batch_id,
                "email_subject": description
            },
            "items": [{
                "recipient_type": "EMAIL",
                "amount": {
                    "value": amount,
                    "currency": "USD"
                },
                "receiver": email,
                "note": description,
            }]
        };
        let response = new Promise((resolve, reject) => {
            paypal.payout.create(create_payout_json, (error, payout) => {
                if (error) {
                    console.log("ERROR:" + error.response);
                    // throw error;
                    reject(error);
                } else {
                    console.log('SUCCESS PAYOUT');
                    resolve(payout);
                }
            });
        });

        return response;

    } catch (err) {
        return err;
    }
}


paypalPaymentController.paypalPayoutStatusCheck = async function (payoutBatchId) {
    try {
        let response = new Promise((resolve, reject) => {
            paypal.payout.get(payoutBatchId, (error, payout) => {
                if (error) {
                    console.log("ERROR:" + error.response);
                    // throw error;
                    reject(error);
                } else {
                    resolve({
                        data: payout.batch_header,
                        // items: payout.items,
                    });

                }
            });
        });

        return response;

    } catch (err) {
        return err;
    }
}


paypalPaymentController.paypalPaymentStatusCheck = async function (paymentId) {
    try {
        let response = new Promise((resolve, reject) => {
            paypal.payment.get(paymentId, (error, payment) => {
                if (error) {
                    console.log("ERROR:" + error.response);
                    reject(error);
                } else {
                    // Send the payment status and details as a response
                    resolve({
                        id: payment.id,
                        state: payment.state, // Payment state (e.g., "approved", "failed")
                        create_time: payment.create_time,
                        update_time: payment.update_time,
                        transactions: payment.transactions,
                        payer: payment.payer,
                    });
                }
            });
        });

        return response;

    } catch (err) {
        return err;
    }
}


paypalPaymentController.refundPayment = async function (paymentId) {
    try {
        const paymentData = await paypalPaymentController.paypalPaymentStatusCheck(paymentId);

        const refund_data = {
            amount: {
                currency: paymentData.transactions[0].amount.currency,
                total: paymentData.transactions[0].amount.total,
            }
        };
        const saleId = payment.transactions[0].related_resources[0].sale.id;

        let response = new Promise((resolve, reject) => {
            paypal.sale.refund(saleId, refund_data, (error, refund) => {
                if (error) {
                    console.log(error.response);
                    // res.status(500).send('Error processing refund');
                    reject(error);
                } else {
                    // Send refund details as a response
                    resolve({
                        id: refund.id,
                        state: refund.state, // Refund state (e.g., "completed")
                        sale_id: refund.sale_id,
                        amount: refund.amount,
                        create_time: refund.create_time,
                        update_time: refund.update_time,
                    });
                }
            });
        });

        return response;

    } catch (err) {
        return err;
    }
}

module.exports = paypalPaymentController;