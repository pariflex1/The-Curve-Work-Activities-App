import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://pxofmqorcpbnwapnzjkv.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4b2ZtcW9yY3BibndhcG56amt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MDU5MDQsImV4cCI6MjEwMzI4MTkwNH0.trZKNdYcsO2vkJqDJHaEM1xBaRSWRUMR8qRq5cfu6H0";

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function testLogin() {
  console.log("Testing email login...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "info@thecurveconsultants.com",
    password: "thecurve@123",
  });

  if (error) {
    console.error("  [FAILED] Login error:", error.message);
  } else {
    console.log("  [SUCCESS] Logged in as:", data.user?.email, "ID:", data.user?.id);
  }
}

testLogin();
