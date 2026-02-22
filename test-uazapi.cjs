const axios = require('axios');

const url = 'https://chatwind.uazapi.com';
const key = 'RWQ10BgwCmNbgHnRXxfipgRaD4JNCTSbMvN77GBdr1T0CVrV5U'.trim();

async function test(path, headers) {
    try {
        const fullUrl = `${url}${path}`;
        console.log(`POST ${fullUrl} headers: ${JSON.stringify(headers)}`);
        const res = await axios.post(fullUrl, { instanceName: 'test_' + Date.now(), qrcode: true }, { headers });
        console.log('SUCCESS:', res.status, res.data);
    } catch (err) {
        console.log('FAILED:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
    }
}

async function testGet(path, headers) {
    try {
        const fullUrl = `${url}${path}`;
        console.log(`GET ${fullUrl} headers: ${JSON.stringify(headers)}`);
        const res = await axios.get(fullUrl, { headers });
        console.log('SUCCESS:', res.status, res.data);
    } catch (err) {
        console.log('FAILED:', err.response ? err.response.status : err.message, err.response ? err.response.data : '');
    }
}

async function run() {
    const headersList = [
        { 'apikey': key },
        { 'ApiKey': key },
        { 'Authorization': `Bearer ${key}` },
        { 'Authorization': key },
        { 'token': key },
        { 'admin_token': key },
        { 'Global-Api-Key': key }
    ];

    console.log("--- Testing /instance/create ---");
    for (const h of headersList) {
        await test('/instance/create', h);
    }

    console.log("\n--- Testing /instance/fetchInstances ---");
    for (const h of headersList) {
        await testGet('/instance/fetchInstances', h);
    }
}

run();
