import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function triggerPulse() {
    console.log("Triggering Pulse Cron...");
    
    const secret = process.env.CRON_SECRET;
    // We are simulating the local next.js server running on port 9002
    const url = `http://localhost:9002/api/cron/pulse?secret=${secret}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Local fetch failed. Make sure the dev server is running on port 9002.");
        console.error(e);
    }
}

triggerPulse();
