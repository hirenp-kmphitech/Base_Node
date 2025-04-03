const Verifier = require('google-play-billing-validator');
const privateKey = global.PRIVATE_KEY
// const productId = "standard_plan_20"
// const purchaseToken = "imkjfhipbecllbkkllplocmm.AO-J1OxIOLXFzPi0hm5TTDDQraHtQ4ekcmhak-14_q7nm_5y5j3LNFHxfQ9iVEud70z3dTgv_pP6iGD8ag21BSXdB6dBZY21yZLxmjrKT9gejXepgD56iEobNQ1c-EK0WEnXlH47jM4i"

async function verifySubscription(productId, purchaseToken) {
    const promise = new Promise((resolve, reject) => {
        const options = {
            "email": global.SERVICE_ACCOUNT_EMAIL,
            "key": privateKey
        };
        const verifier = new Verifier(options);
        const receipt = {
            packageName: global.ANDROID_PACKAGE,
            productId: productId,
            purchaseToken: purchaseToken
        }
        // const promiseData = verifier.verifyINAPP(receipt)
        const promiseData = verifier.verifySub(receipt);
        resolve(promiseData);
    })

    return await promise;
};
module.exports = { verifySubscription };
