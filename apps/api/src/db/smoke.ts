import "dotenv/config";
import { db } from "./client.js";
import { users } from "./schema.js";

async function main() {
  const rows = await db.select().from(users).limit(1);
  console.log("ok users.select:", rows.length);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
