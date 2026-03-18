#!/bin/bash
# Show VN product discoveries since last Claude session.
# Called by UserPromptSubmit hook — must be fast and silent on no news.

LOG_FILE="src/data/vn-additions-log.json"
if [ ! -f "$LOG_FILE" ]; then
  exit 0
fi

node --input-type=module << 'EOF'
import { readFileSync, writeFileSync } from "fs";

const logFile = "src/data/vn-additions-log.json";
const log = JSON.parse(readFileSync(logFile, "utf-8"));

const last = log.lastNotifiedAt || "";
const newOnes = log.additions.filter((a) => a.discoveredAt > last);

if (newOnes.length === 0) process.exit(0);

console.log(`\n--- VN Discovery: ${newOnes.length} new products since last session ---`);
for (const p of newOnes) {
  const platform = p.shopeeUrl ? "Shopee" : "Lazada";
  console.log(`  + [${p.brand}] ${p.name} (${platform})`);
}
console.log("---\n");

// Mark as notified
log.lastNotifiedAt = new Date().toISOString().slice(0, 10);
writeFileSync(logFile, JSON.stringify(log, null, 2));
EOF
