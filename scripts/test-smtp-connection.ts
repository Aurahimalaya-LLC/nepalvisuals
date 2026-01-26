import nodemailer from 'nodemailer';

const SMTP_CONFIG = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465
    auth: {
        user: 'info@nepalvisuals.com',
        pass: 'hvmv rozv jtze itjq'
    }
};

const main = async () => {
    console.log('Testing SMTP Connection...');
    console.log(`Host: ${SMTP_CONFIG.host}`);
    console.log(`Port: ${SMTP_CONFIG.port}`);
    console.log(`User: ${SMTP_CONFIG.auth.user}`);
    console.log('----------------------------------------');

    const transporter = nodemailer.createTransport(SMTP_CONFIG);

    try {
        // 1. Verify Connection
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection Successful!');

        // 2. Send Test Email
        // Note: Sending to self for testing
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"SMTP Test" <${SMTP_CONFIG.auth.user}>`,
            to: SMTP_CONFIG.auth.user, // Send to self
            subject: 'SMTP Configuration Test - Nepal Visuals',
            text: 'If you are reading this, the SMTP configuration is working correctly.',
            html: '<h3>SMTP Configuration Test</h3><p>✅ Connection successful.</p><p>This email confirms that your SMTP credentials for <strong>info@nepalvisuals.com</strong> are valid.</p>'
        });

        console.log('✅ Test Email Sent!');
        console.log(`Message ID: ${info.messageId}`);
        console.log(`Response: ${info.response}`);

    } catch (error: any) {
        console.error('❌ SMTP Test Failed:');
        console.error(error);
        process.exit(1);
    }
};

main();
