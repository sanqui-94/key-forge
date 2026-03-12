import { randomBytes, createHash } from "crypto";
import prisma from "./lib/prisma";

async function main() {
  const randomSuffix = randomBytes(32).toString("hex");
  const fullKey = `kf_${randomSuffix}`;
  const hash = createHash("sha256").update(fullKey).digest("hex");
  
  const id = `key_${randomBytes(16).toString("hex")}`;

  await prisma.apiKey.create({
    data: {
      id,
      name: "CLI Test Key",
      keyHash: hash,
      keyPrefix: `kf_${randomSuffix.substring(0, 4)}...`,
      scopes: ["READ"],
      userId: "user_test_cli", 
    },
  });

  console.log("==> COPY THIS KEY <==");
  console.log(fullKey);
}

main().catch(console.error).finally(() => prisma.$disconnect());
