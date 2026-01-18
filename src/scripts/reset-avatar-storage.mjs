import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // Ignore missing .env.local
  }
}

function requireEnv(value, name) {
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

async function listAllPaths(supabase, bucket, prefix) {
  const paths = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, {
      limit,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data || data.length === 0) break;

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (!item.id && !item.metadata) {
        const nested = await listAllPaths(supabase, bucket, itemPath);
        paths.push(...nested);
        continue;
      }
      paths.push(itemPath);
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = requireEnv(process.env.SUPABASE_URL, "SUPABASE_URL");
  const serviceKey = requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.SUPABASE_AVATAR_BUCKET ?? "avartarStorage";
  const prefix = process.env.RESET_PREFIX ?? "";
  const dryRun = process.argv.includes("--dry-run") || process.env.DRY_RUN === "1";

  const supabase = createClient(supabaseUrl, serviceKey);
  const paths = await listAllPaths(supabase, bucket, prefix);

  if (paths.length === 0) {
    console.log("No files to delete");
    return;
  }

  if (dryRun) {
    console.log(`[DRY RUN] ${paths.length} files would be deleted`);
    for (const p of paths) console.log(p);
    return;
  }

  const chunkSize = 100;
  for (let i = 0; i < paths.length; i += chunkSize) {
    const chunk = paths.slice(i, i + chunkSize);
    const { error } = await supabase.storage.from(bucket).remove(chunk);
    if (error) throw error;
  }

  console.log(`Deleted ${paths.length} files from ${bucket}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
