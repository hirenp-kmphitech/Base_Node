const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const config = require("../config/app.config");

// Initialize the S3 client
const s3Client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: atob(config.AWS_S3.accessKeyId),
        secretAccessKey: atob(config.AWS_S3.secretAccessKey),
    },
});

// Specify your bucket name
const bucketName = "vidassetsa";

exports.uploadS3Media = async function (filePath, newFileName, mimeType = "video/mp4") {
    if (!config.AWS_S3.enabled) {
        console.log("AWS S3 is disabled.");
        return;
    }

    try {
        // Read the video file
        const fileContent = fs.readFileSync(filePath);

        // Set the parameters for the S3 upload
        const params = {
            Bucket: bucketName,
            Key: newFileName, // The name you want to give to your file in the bucket
            Body: fileContent,
            ContentType: mimeType, // Adjust the content type based on your video format
        };

        // Upload the video to S3
        const command = new PutObjectCommand(params);
        const response = await s3Client.send(command);

        // Remove the file locally after upload
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error removing local file:", err);
            } else {
                console.log("Local file removed successfully.");
            }
        });

        console.log("Video uploaded successfully. S3 URL:", `https://${bucketName}.s3.${s3Client.config.region}.amazonaws.com/${newFileName}`);
        return `https://${bucketName}.s3.${s3Client.config.region}.amazonaws.com/${newFileName}`;
    } catch (error) {
        console.error("Error uploading video:", error);
        throw error;
    }
};

exports.deleteS3Media = async function (filePath) {
    if (!config.AWS_S3.enabled) {
        console.log("AWS S3 is disabled.");
        return;
    }

    try {
        // Set the parameters for S3 delete
        const params = {
            Bucket: bucketName,
            Key: filePath,
        };

        // Delete the file from S3
        const command = new DeleteObjectCommand(params);
        const response = await s3Client.send(command);

        console.log("Video deleted successfully:", response);
        return response;
    } catch (error) {
        console.error("Error deleting video:", error);
        throw error;
    }
};
