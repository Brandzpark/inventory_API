const { S3Client, ListBucketsCommand, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, CopyObjectCommand } = require("@aws-sdk/client-s3");
const { fromEnv } = require('@aws-sdk/credential-providers')
const { aws } = require("../../config");

const REGION = aws.region;

const s3Client = new S3Client({
    region: REGION,
    credentials: fromEnv()
});

async function listBuckets() {
    try {
        const data = await s3Client.send(new ListBucketsCommand({}));
        console.log("Success", data.Buckets);
    } catch (err) {
        console.log("Error", err);
    }
}

async function uploadFile(file, folder) {
    try {
        const params = {
            Bucket: aws.bucketName,
            Key: `${folder}/` + Date.now() + ".jpg",
            Body: file
        };
        const data = await s3Client.send(new PutObjectCommand(params));
        console.log("File uploaded successfully", data);
    } catch (err) {
        console.log("Error uploading file", err);
    }
}

async function downloadFile(fileName) {
    try {
        const params = {
            Bucket: aws.bucketName,
            Key: fileName
        };
        const data = await s3Client.send(new GetObjectCommand(params));
        console.log("File downloaded successfully", data.Body.toString());
    } catch (err) {
        console.log("Error downloading file", err);
    }
}

async function deleteObject(fileName) {
    try {
        const params = {
            Bucket: aws.bucketName,
            Key: fileName
        };
        const data = await s3Client.send(new DeleteObjectCommand(params));
        console.log("Object deleted successfully", data);
    } catch (err) {
        console.log("Error deleting object", err);
    }
}

async function copyObject(sourceFolder, folder, fileName) {
    try {
        const params = {
            Bucket: aws.bucketName,
            CopySource: `/${aws.bucketName}/${sourceFolder}/${fileName}`,
            Key: `${folder}/${fileName}`
        };
        const data = await s3Client.send(new CopyObjectCommand(params));
        console.log("Object copied successfully", data);
    } catch (err) {
        console.log("Error copying object", err);
    }
}

module.exports = {
    listBuckets,
    uploadFile,
    downloadFile,
    deleteObject,
    copyObject
}