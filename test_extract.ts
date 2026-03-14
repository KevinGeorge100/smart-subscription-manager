import { extractSub } from './src/lib/genkit/parser';

const emailText = process.env.EMAIL_TEXT;

if (!emailText) {
  console.error("Please provide EMAIL_TEXT environment variable");
  process.exit(1);
}

async function run() {
  console.log("Analyzing email...");
  const result = await extractSub(emailText as string);
  console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
