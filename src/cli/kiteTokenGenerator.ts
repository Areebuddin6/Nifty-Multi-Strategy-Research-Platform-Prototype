/**
 * Zerodha Kite Connect v3 Daily Session Access Token Generator CLI
 * 
 * Usage:
 *   npx tsx src/cli/kiteTokenGenerator.ts
 *   npx tsx src/cli/kiteTokenGenerator.ts --request-token <TOKEN>
 * 
 * Flow:
 *   1. Reads KITE_API_KEY and KITE_API_SECRET from .env
 *   2. Displays the browser login URL
 *   3. Accepts the request_token returned on redirect
 *   4. Calculates SHA256(api_key + request_token + api_secret)
 *   5. POSTs to https://api.kite.trade/session/token
 *   6. Displays session access_token and updates .env automatically!
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';

dotenv.config();

function promptUser(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(query, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function updateEnvFile(key: string, value: string) {
  const envPath = path.join(process.cwd(), '.env');
  let content = '';
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, 'utf8');
  }

  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content = content ? `${content}\n${key}=${value}` : `${key}=${value}`;
  }

  fs.writeFileSync(envPath, content, 'utf8');
}

async function main() {
  console.log('================================================================');
  console.log(' Zerodha Kite Connect v3 - Daily Session Token Generator');
  console.log('================================================================\n');

  const apiKey = process.env.KITE_API_KEY;
  const apiSecret = process.env.KITE_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('❌ Error: KITE_API_KEY and/or KITE_API_SECRET are not defined in .env');
    console.error('\nPlease ensure your .env file contains:');
    console.error('  KITE_API_KEY=your_api_key');
    console.error('  KITE_API_SECRET=your_api_secret\n');
    process.exit(1);
  }

  console.log(`✓ Loaded KITE_API_KEY:    ${apiKey.slice(0, 4)}••••`);
  console.log(`✓ Loaded KITE_API_SECRET: ${apiSecret.slice(0, 4)}••••\n`);

  // Check for command line argument --request-token
  const args = process.argv.slice(2);
  let requestToken = '';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--request-token' && args[i + 1]) {
      requestToken = args[i + 1].trim();
    }
  }

  const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${encodeURIComponent(apiKey)}`;

  if (!requestToken) {
    console.log('Step 1: Open this official login URL in your browser:');
    console.log(`----------------------------------------------------------------`);
    console.log(`\x1b[36m${loginUrl}\x1b[0m`);
    console.log(`----------------------------------------------------------------\n`);
    console.log('Step 2: Authenticate with your Zerodha Client ID, Password, and TOTP.');
    console.log('Step 3: After login, you will be redirected to your configured redirect URL:');
    console.log('        e.g., http://127.0.0.1:3000/api/kite/callback?request_token=XXXXXX&action=login&status=success\n');

    requestToken = await promptUser('Paste the request_token from the URL here: ');
  }

  if (!requestToken) {
    console.error('❌ Error: No request_token provided. Aborting.');
    process.exit(1);
  }

  console.log('\nExchanging request_token for daily access_token...');

  // SHA256 checksum: api_key + request_token + api_secret
  const checksumInput = `${apiKey}${requestToken}${apiSecret}`;
  const checksum = crypto.createHash('sha256').update(checksumInput).digest('hex');

  const formData = new URLSearchParams();
  formData.append('api_key', apiKey);
  formData.append('request_token', requestToken);
  formData.append('checksum', checksum);

  try {
    const response = await fetch('https://api.kite.trade/session/token', {
      method: 'POST',
      headers: {
        'X-Kite-Version': '3',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const json: any = await response.json();

    if (json.status !== 'success' || !json.data?.access_token) {
      console.error('\n❌ Token exchange failed:');
      console.error(`Message:    ${json.message || 'Unknown error'}`);
      console.error(`Error Type: ${json.error_type || 'Unknown'}`);
      process.exit(1);
    }

    const { access_token, user_id, user_name, email, broker } = json.data;

    console.log('\n================================================================');
    console.log('🎉 Kite Connect v3 Authentication Successful!');
    console.log('================================================================');
    console.log(`User Name:    ${user_name}`);
    console.log(`User ID:      ${user_id}`);
    console.log(`Email:        ${email}`);
    console.log(`Broker:       ${broker}`);
    console.log(`Access Token: ${access_token}`);
    console.log('----------------------------------------------------------------');

    // Automatically write to .env
    updateEnvFile('KITE_ACCESS_TOKEN', access_token);
    console.log('✓ Successfully saved KITE_ACCESS_TOKEN into local .env file.');
    console.log('You can now run historical data fetchers or backtests from terminal!\n');
    console.log('Next commands to try:');
    console.log('  npm run kite:fetch -- --universe NIFTY_500 --limit 10');
    console.log('  npm run kite:backtest -- --strategy supertrend_swing --universe NIFTY_500\n');
  } catch (err: any) {
    console.error('❌ Network error during token exchange:', err.message);
    process.exit(1);
  }
}

main().catch(console.error);
