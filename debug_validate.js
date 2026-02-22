
const fetch = require('node-fetch');

async function check() {
    try {
        const res = await fetch('http://localhost:3006/api/tracking/frm_ZrUJW0FJbs/validate');
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
