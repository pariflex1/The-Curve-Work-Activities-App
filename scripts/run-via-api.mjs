import fs from "fs";

const PROJECT_REF = "pxofmqorcpbnwapnzjkv";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzcwNTkwNCwiZXhwIjoyMTAzMjgxOTA0fQ.0U9AT1LJ-OXlhAx-QIKchi4C2ZilfdlFjmvzRFJuHRw";

const sql = fs.readFileSync("supabase/master_schema_pxofmqorcpbnwapnzjkv.sql", "utf-8");

async function run() {
  console.log("Attempting SQL execution via Supabase API...");
  try {
    const res = await fetch(`https://${PROJECT_REF}.supabase.co/rest/v1/rpc`, {
      method: "POST",
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    });
    console.log("Response status:", res.status);
    const text = await res.text();
    console.log("Response text:", text);
  } catch (err) {
    console.error("API error:", err);
  }
}

run();
