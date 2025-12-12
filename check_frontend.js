// Frontend Setup Verification Script
console.log("🔍 Checking Frontend Setup...");
console.log("=".repeat(50));

// Check if running in browser
if (typeof window === 'undefined') {
  console.log("❌ This script must run in a browser");
} else {
  console.log("✅ Browser environment detected");
  
  // Check MediaRecorder support
  if (typeof MediaRecorder !== 'undefined') {
    console.log("✅ MediaRecorder API available");
  } else {
    console.log("❌ MediaRecorder API not available");
  }
  
  // Check Audio API
  if (typeof Audio !== 'undefined') {
    console.log("✅ Audio API available");
  } else {
    console.log("❌ Audio API not available");
  }
  
  // Test backend connection
  const backendUrl = "http://localhost:8000";
  console.log(`\n📡 Testing Backend Connection...`);
  console.log(`Backend URL: ${backendUrl}`);
  
  // Test HTTP
  fetch(`${backendUrl}/test-services`)
    .then(res => res.json())
    .then(data => {
      console.log("✅ HTTP Connection: OK");
      console.log("Response:", data);
    })
    .catch(err => {
      console.log("❌ HTTP Connection Failed:", err.message);
      console.log("Make sure backend is running on port 8000");
    });
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Frontend checks complete!");
  console.log("\nTo start frontend:");
  console.log("  npm run dev");
  console.log("  OR");
  console.log("  yarn dev");
}

