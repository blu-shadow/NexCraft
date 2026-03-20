const mongoose = require("mongoose");

// ─────────────────────────────────────────
//   Color codes for terminal logs
// ─────────────────────────────────────────
const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const RESET  = "\x1b[0m";

// ─────────────────────────────────────────
//   MongoDB Connection Function
// ─────────────────────────────────────────
const connectDB = async () => {
  try {
    console.log(`\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.log(`${YELLOW}  🔌 Connecting to MongoDB...${RESET}`);
    console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });

    console.log(`${GREEN}  ✅ MongoDB Connected Successfully!${RESET}`);
    console.log(`${GREEN}  🌐 Host     : ${conn.connection.host}${RESET}`);
    console.log(`${GREEN}  🗄️  Database : ${conn.connection.name}${RESET}`);
    console.log(`${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);

  } catch (error) {
    console.error(`\n${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}`);
    console.error(`${RED}  ❌ MongoDB Connection Failed!${RESET}`);
    console.error(`${RED}  🔴 Error : ${error.message}${RESET}`);
    console.error(`${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n`);
    process.exit(1); // Server বন্ধ করে দেবে connection fail হলে
  }
};

// ─────────────────────────────────────────
//   Mongoose Global Event Listeners
// ─────────────────────────────────────────
mongoose.connection.on("disconnected", () => {
  console.warn(`${YELLOW}  ⚠️  MongoDB Disconnected!${RESET}`);
});

mongoose.connection.on("reconnected", () => {
  console.log(`${GREEN}  🔄 MongoDB Reconnected!${RESET}`);
});

mongoose.connection.on("error", (err) => {
  console.error(`${RED}  ❌ MongoDB Error: ${err.message}${RESET}`);
});

module.exports = connectDB;
