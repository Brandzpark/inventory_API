module.exports = {
    port: process.env.PORT ?? 4015,
    key: process.env.KEY ?? "VXNlclByb2plY3RNYW5hZ2VtZW50RW5jcnlwdGlvbg==",
    database: {
        database: process.env.DB_NAME ?? "inventory-system",
        host: process.env.DB_HOST ?? "cluster0.ry6ev.mongodb.net",
        user: process.env.DB_USER ?? "yohan",
        password: process.env.DB_PASSWORD ?? "123admin",
    },
    aws: {
        accessKey: process.env.AWS_ACCESS_KEY_ID,
        secretKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucketName: process.env.AWS_BUCKET_NAME,
        region: process.env.AWS_DEFAULT_REGION ?? "ap-southeast-1",
    },
    mail: {
        host: process.env.MAIL_HOST ?? "sandbox.smtp.mailtrap.io",
        port: process.env.MAIL_PORT ?? "2525",
        user: process.env.MAIL_USER ?? "f9fecd0286844e",
        password: process.env.MAIL_PASSWORD ?? "892bf2563cf0ad",
        fromAddress: process.env.MAIL_FROM_ADDRESS ?? "noreply@invsystem.com",
        fromName: process.env.MAIL_FROM_NAME ?? "Inventory System",
    }
};
