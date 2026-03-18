#!/bin/bash
# Show VN product discoveries and audit flags since last Claude session.
# Called by UserPromptSubmit hook — must be fast and silent on no news.

VN_LOG="src/data/vn-additions-log.json"
AUDIT_LOG="src/data/audit-log.json"

# Run both checks; output only if there's news
node --input-type=module << 'EOF'
import { readFileSync, writeFileSync } from "fs";

let hasNews = false;
const today = new Date().toISOString().slice(0, 10);

// ── VN Additions ──────────────────────────────────────────────────────
const vnFile = "src/data/vn-additions-log.json";
try {
  const log = JSON.parse(readFileSync(vnFile, "utf-8"));
  const last = log.lastNotifiedAt || "";
  const newOnes = log.additions.filter((a) => a.discoveredAt > last);

  if (newOnes.length > 0) {
    hasNews = true;
    console.log(`\n--- VN Discovery: ${newOnes.length} new product(s) since last session ---`);
    for (const p of newOnes) {
      const platform = p.shopeeUrl ? "Shopee" : "Lazada";
      console.log(`  + [${p.brand}] ${p.name} (${platform})`);
    }
    console.log("---");
    log.lastNotifiedAt = today;
    writeFileSync(vnFile, JSON.stringify(log, null, 2));
  }
} catch {
  // File missing or malformed — stay silent
}

// ── Audit Flags ───────────────────────────────────────────────────────
const auditFile = "src/data/audit-log.json";
try {
  const log = JSON.parse(readFileSync(auditFile, "utf-8"));
  const last = log.lastNotifiedAt || "";
  const flagged = (log.results || []).filter(
    (r) => r.auditedAt > last && r.flags && r.flags.length > 0
  );

  if (flagged.length > 0) {
    hasNews = true;
    console.log(`\n--- Audit Flags: ${flagged.length} product(s) need manual review ---`);
    for (const r of flagged) {
      console.log(`  ! [${r.brand}] ${r.productName}`);
      for (const flag of r.flags) {
        console.log(`      - ${flag}`);
      }
    }
    console.log("---");
    log.lastNotifiedAt = today;
    writeFileSync(auditFile, JSON.stringify(log, null, 2));
  }
} catch {
  // File missing or malformed — stay silent
}

if (hasNews) console.log();
EOF
