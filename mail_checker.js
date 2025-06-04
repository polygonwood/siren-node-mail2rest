require('dotenv').config();
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const csv = require('csvtojson');
const axios = require('axios');

const config = {
    imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST,
        port: parseInt(process.env.IMAP_PORT),
        tls: true,
        authTimeout: 3000
    }
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function checkMail() {
    const connection = await imaps.connect({ imap: config.imap });
    await connection.openBox('INBOX');
    const searchCriteria = ['UNSEEN'];
    const fetchOptions = { bodies: [''], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);

    for (const item of messages) {
        const all = item.parts.find(part => part.which === '');
        const mail = await simpleParser(all.body);
        console.log('New mail received:', mail.subject);

        // if (mail.attachments && mail.attachments.length > 0) {
        //     for (const att of mail.attachments) {
        //         if (att.contentType === 'text/csv') {
        //             const csvString = att.content.toString();
        //             const jsonArray = await csv().fromString(csvString);

        //             // Example: choose REST path based on a field in JSON
        //             const restUrl = `${process.env.REST_HOST}:${process.env.REST_PORT}${process.env.REST_PATH}`;
        //             await axios.put(restUrl, jsonArray);
        //             console.log('Sent JSON:', JSON.stringify(jsonArray, null, 2));
        //         }
        //     }
        // }
        if (['SIREN', 'SIRENVessel', 'SIRENPosition'].includes(mail.subject)) {
            console.log(`${mail.subject} mail received, processing...`);
            let csvString = mail.text || mail.html;
            // console.log('CSV String:', csvString);
            if (csvString) {
                try {
                    const jsonArray = await csv().fromString(csvString);
                    console.log('Parsed JSON Array:', JSON.stringify(jsonArray, null, 2));
                    const restUrl = `${process.env.REST_HOST}:${process.env.REST_PORT}${process.env.REST_PATH}`;
                    console.log('REST URL:', restUrl);
                    const message = {
                        subject: mail.subject,
                        data: jsonArray
                    }
                    await axios.post(restUrl, message);
                } catch (err) {
                    console.error('Error parsing CSV or sending REST:', err);
                }
            }
        }
        // Mark mail as read
        await connection.addFlags(item.attributes.uid, '\\Seen');
    }
    await connection.end();
}

setInterval(checkMail, parseInt(process.env.CHECK_INTERVAL));
console.log('Mail checker started...');