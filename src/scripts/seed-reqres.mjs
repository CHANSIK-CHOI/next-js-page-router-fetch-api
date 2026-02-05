import { readFileSync } from "node:fs"; // 로컬 파일을 동기적으로 읽기 위한 Node 내장 모듈.
import { resolve } from "node:path"; // 파일 경로를 안전하게 조합하기 위한 Node 내장 모듈.
import { createClient } from "@supabase/supabase-js";

/*
  loadEnvLocal() :
  .env.local 파일을 직접 읽어서 process.env에 채워 넣는 함수.
  Next.js 앱은 자동으로 env를 읽지만, 독립 실행 스크립트는 자동 로드가 안 되기 때문에 필요함.
*/
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

// readUsersFromFile : 로컬 JSON 파일을 읽어서 유저 배열을 반환.
function readUsersFromFile(filePath) {
  const content = readFileSync(filePath, "utf8");
  const json = JSON.parse(content);
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  throw new Error("Invalid users JSON format");
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = requireEnv(process.env.SUPABASE_URL, "SUPABASE_URL");
  const serviceKey = requireEnv(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceKey);
  const dataPath = resolve(process.cwd(), "src/mock/users.json");
  const users = readUsersFromFile(dataPath);

  const baseTime = Date.now();
  const rows = users.map((u, index) => ({
    email: u.email,
    name: u.name,
    phone: u.phone,
    avatar: u.avatar,
    created_at: new Date(baseTime - (users.length - index) * 1000).toISOString(),
  }));

  const { error: deleteError } = await supabase.from("users").delete().not("id", "is", null);
  if (deleteError) throw deleteError;

  const { error } = await supabase.from("users").insert(rows);
  if (error) throw error;

  console.log("seed done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
