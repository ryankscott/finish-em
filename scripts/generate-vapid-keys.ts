// Prints a new VAPID key pair for Web Push. Store both as Worker secrets:
//   wrangler secret put VAPID_PUBLIC_KEY
//   wrangler secret put VAPID_PRIVATE_KEY
//   wrangler secret put VAPID_SUBJECT   (e.g. mailto:you@example.com)
// Rotating the keys invalidates every existing browser subscription.
import { generateVapidKeys } from "../src/server/push/web-push";

const { publicKey, privateKey } = await generateVapidKeys();
console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
