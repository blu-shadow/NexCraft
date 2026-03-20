// ═══════════════════════════════════════════════════════════
//                  1000 DIN WEB APP — SERVER
// ═══════════════════════════════════════════════════════════

const express    = require("express");
const dotenv     = require("dotenv");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");
const path       = require("path");

const connectDB  = require("./config/db");

// ─────────────────────────────────────────
//   Load Environment Variables
// ─────────────────────────────────────────
dotenv.config();

// ─────────────────────────────────────────
//   Connect to MongoDB
// ─────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────
//   Initialize Express App
// ─────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════════════════════════
//                      MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// ── Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// ── CORS — Frontend কে Allow করা
app.use(
  cors({
    origin      : process.env.CLIENT_URL || "http://localhost:5173",
    credentials : true,
    methods     : ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── Body Parsers
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ── HTTP Request Logger (Development only)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Static Files (Local uploads — development)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ── Global Rate Limiter — DDoS Protection
const globalLimiter = rateLimit({
  windowMs : 15 * 60 * 1000, // 15 minutes
  max      : 200,             // max 200 requests per window
  message  : {
    success : false,
    message : "Too many requests. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders  : false,
});
app.use(globalLimiter);

// ── Auth Specific Rate Limiter — Brute Force Protection
const authLimiter = rateLimit({
  windowMs : 10 * 60 * 1000, // 10 minutes
  max      : 10,             // max 10 login attempts
  message  : {
    success : false,
    message : "Too many login attempts. Please wait 10 minutes.",
  },
});

// ═══════════════════════════════════════════════════════════
//                        API ROUTES
// ═══════════════════════════════════════════════════════════

// ── Auth Routes
app.use("/api/auth",    authLimiter, require("./routes/auth.routes"));

// ── User Routes
app.use("/api/users",   require("./routes/user.routes"));

// ── Admin Routes
app.use("/api/admin",   require("./routes/admin.routes"));

// ── Service Routes (Web Design, App Dev, etc.)
app.use("/api/services", require("./routes/service.routes"));

// ── Order Routes
app.use("/api/orders",  require("./routes/order.routes"));

// ── YouTube Video Routes
app.use("/api/youtube", require("./routes/youtube.routes"));

// ── Blog Routes
app.use("/api/blogs",   require("./routes/blog.routes"));

// ═══════════════════════════════════════════════════════════
//                      HEALTH CHECK
// ═══════════════════════════════════════════════════════════
app.get("/", (req, res) => {
  res.status(200).json({
    success : true,
    message : "🚀 1000 Din Web App Server is Running!",
    version : "1.0.0",
    env     : process.env.NODE_ENV,
    time    : new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" }),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success  : true,
    status   : "OK",
    uptime   : `${Math.floor(process.uptime())} seconds`,
    memory   : `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    time     : new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" }),
  });
});

// ═══════════════════════════════════════════════════════════
//                    404 — ROUTE NOT FOUND
// ═══════════════════════════════════════════════════════════
app.use((req, res, next) => {
  res.status(404).json({
    success : false,
    message : `❌ Route not found: [${req.method}] ${req.originalUrl}`,
  });
});

// ═══════════════════════════════════════════════════════════
//                 GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  // Multer File Error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success : false,
      message : "❌ File size is too large.",
    });
  }

  // JWT Error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success : false,
      message : "❌ Invalid token. Please login again.",
    });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success : false,
      message : messages.join(", "),
    });
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success : false,
      message : `❌ ${field} already exists. Please use a different one.`,
    });
  }

  // Generic Error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success : false,
    message : err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ═══════════════════════════════════════════════════════════
//                    START SERVER
// ═══════════════════════════════════════════════════════════
const server = app.listen(PORT, () => {
  const CYAN   = "\x1b[36m";
  const GREEN  = "\x1b[32m";
  const YELLOW = "\x1b[33m";
  const RESET  = "\x1b[0m";

  console.log(`\n${CYAN}╔══════════════════════════════════════════╗${RESET}`);
  console.log(`${CYAN}║${GREEN}   🚀  1000 DIN SERVER STARTED!          ${CYAN}║${RESET}`);
  console.log(`${CYAN}╠══════════════════════════════════════════╣${RESET}`);
  console.log(`${CYAN}║${RESET}  Mode    : ${YELLOW}${process.env.NODE_ENV}${RESET}`);
  console.log(`${CYAN}║${RESET}  Port    : ${GREEN}http://localhost:${PORT}${RESET}`);
  console.log(`${CYAN}║${RESET}  Health  : ${GREEN}http://localhost:${PORT}/api/health${RESET}`);
  console.log(`${CYAN}║${RESET}  Client  : ${GREEN}${process.env.CLIENT_URL}${RESET}`);
  console.log(`${CYAN}╚══════════════════════════════════════════╝${RESET}\n`);
});

// ─────────────────────────────────────────
//   Handle Unhandled Promise Rejections
// ─────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error(`\n\x1b[31m❌ Unhandled Rejection: ${err.message}\x1b[0m`);
  server.close(() => process.exit(1));
});

// ─────────────────────────────────────────
//   Handle Uncaught Exceptions
// ─────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error(`\n\x1b[31m❌ Uncaught Exception: ${err.message}\x1b[0m`);
  process.exit(1);
});

// ─────────────────────────────────────────
//   Graceful Shutdown (CTRL+C)
// ─────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("\n\x1b[33m⚠️  SIGTERM received. Shutting down gracefully...\x1b[0m");
  server.close(() => {
    console.log("\x1b[32m✅ Server closed.\x1b[0m\n");
    process.exit(0);
  });
});
