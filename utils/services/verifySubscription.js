const Verifier = require('google-play-billing-validator');
const logger = require('./logger');
const privateKey = global.PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCWJLYlGWeuAsyx\napDDbP/O5tQtCtIc8tKNJyGjdiW4LrsDXW3txrO3jrn2+P7gJR/trMeohZmanfcU\nrvVNVpY9qiom1x1HJnhamSKvxHVkceo/ZgM0QX9eqMLtKFWYQ4OIzdO7sVz0i58+\nsSTamzyIIftaSyKWfRP9UUU2lRQDjUeQIRkt2yllH9LWGsIcHf5jA6kYE8bV3aJl\nqOHjS7H+1P9uLWOC/Y8PeCJBU8O6RAr2D/RKROtjx7ErGN1mX94lmaS5acaZtx7y\niiDDWyxF4V8m2t8jjcwqrtTbupIMP6PsuRmPRpMZyKTNbO7IQut3GmkfvPhoffHF\nZsKXrvGJAgMBAAECggEANDtbPjbDUc7ZhNLsv3+Y0lKM94pvI/D5fG9jjWkZoCRp\nnLcQ+goJFU9KtHdUu4dOvzE/WAn6MMbJYOGoppn7tEIRXeex4MGqVuI1Je5zZFkY\nw6tqa/BpLfYJsdU5Sboa9SmdggsmqlA0OuwHRSGCAl3IAlZnFvE2VgbCzEU6bC1e\nV25m/YkFnCTst+fM3HdVIwWiw0whLJ6YJu8cF8wfCb+ACL45SBRFOy98E+sp5ufd\nv5ryHHo3cnFicfMHPgTakpgDlzYqYC79+TAF9J1g2rJaz3zsu7p/20Pc4SRMTnEJ\nSw9jTGumoOXSBU7PFQKTiwq6Z7UiV7Q+/VyRYGRTPQKBgQDPzEjaIUa7R8PEBRP3\nJ+eTDEz5g9FdohQwOfx2sO9W4b4om+A+kmw78NEogW8dtgjSnWlStz2X2p+Om50+\ns9JqhhgttGJp5ksJg7QMlGdERbbtP4hml/OIqHs8aBS/ParodV1gvH0o1ojhHKjZ\nMsKgbYP5bI8MM25JWLb28kSJAwKBgQC4+LYvcTAFz4onFVXVUJ8YrmlHT7uStLRi\nPhi9iWy04FBu0d8r5eTzl94mWEu0zcOg6aBVybsBsdE6KL9ZNA/MIf9bhLNDysBD\nMtSyNQBO/Pl7krqogaPnCGWyG+UAZdksYSyaVwmQNYXSAWZx6EJtwq0c7eYSD4GY\n+nxnwd9HgwKBgAjynPh3kloiHvXj2hY8a6ZTU0UzPeKwRfpFpO9fcw7krZGGFMPc\n/jgeiIMb/7Lh0cNv78cWCNrvGQvE+6Jlj9vyZjwhllNFDVodh7U69q9j6RqSL8dr\nJ5ts1dGmEa6icyeLVjgCJcmKY15+I28m1maeEJ6+4/H8jPUvksFTcUwNAoGAM0zH\nOmEp8HKe3jgMlhzGAxJcIGr8mrODU7vlIKv8ei28IQAT5RjdZrG36uqSFJL8rqQc\n064fL1khrf+fEh5eQz8qkzc6gJK6v+hZFROeAkom5x7KpfFOg8TQb5VM7c9Ra/2H\nYUbCYDx34MaCoxTHV6mmWV+hb2DdkI/n8N7UDgECgYBckfrGWC7SmmKtnEMxq0Ih\npNfhSClFcWO5kwxJ0KcJvS8RjVYXuxnApkuwpNHOsfasoEazk1ZZtxyvqOLs731p\nAV41dcbPjgaQcNhQJCq9we+Yi19etOankkkoCEO7gjEixetxRsLE2LbHb/dwZoor\nmYi2NIbmwDwN7MFGI8Uqlw==\n-----END PRIVATE KEY-----\n"

async function verifySubscription(productId, purchaseToken, purchaseType = "Subscription") {
    try {
        const promise = new Promise(async (resolve, reject) => {
            const options = {
                "email": global.SERVICE_ACCOUNT_EMAIL || "soakstreaminapp@soakstream-app-project.iam.gserviceaccount.com",
                "key": privateKey
            };
            const verifier = new Verifier(options);
            const receipt = {
                packageName: global.ANDROID_PACKAGE || "com.app.soakstream",
                productId: productId,
                purchaseToken: purchaseToken
            }
            let promiseData;
            if (purchaseType == "Subscription") {
                promiseData = await verifier.verifySub(receipt);
            }
            else {
                promiseData = await verifier.verifyINAPP(receipt)
            }

            resolve(promiseData);
        })

        return await promise;
    } catch (error) {
        logger.info("errror from subscription verify:" + error);
        return error;
    }

};
module.exports = { verifySubscription };
