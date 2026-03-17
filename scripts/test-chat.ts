import { askSubZero } from '../src/lib/genkit/flows/chat';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testFullFlow() {
    console.log("Testing Complete AskSubZero Flow...");
    
    const mockSubscriptions = [
        { name: 'Netflix', amount: 649, billingCycle: 'monthly', category: 'Streaming' },
        { name: 'Amazon Web Services', amount: 1500, billingCycle: 'monthly', category: 'Cloud' }
    ];
    
    const query = "What is my total streaming spend?";
    
    try {
        const result = await askSubZero(query, mockSubscriptions as any);
        console.log("\n--- AI Response JSON ---");
        console.log(JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Failed:", e);
    }
}

testFullFlow();
