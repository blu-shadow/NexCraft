const mongoose = require("mongoose");

// ═══════════════════════════════════════════════════════════
//                     ORDER SCHEMA
// ═══════════════════════════════════════════════════════════

const orderSchema = new mongoose.Schema(
  {
    // ── Order ID (Human-readable)
    orderId: {
      type  : String,
      unique: true,
    },

    // ── Service Reference
    service: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : "Service",
      required: [true, "Service is required"],
    },

    // ── Customer Info (User or Guest)
    user: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : "User",
      default: null, // Guest হলে null
    },

    // Guest Customer Info
    customerInfo: {
      name   : { type: String, required: [true, "Customer name is required"], trim: true },
      email  : {
        type    : String,
        required: [true, "Customer email is required"],
        lowercase: true,
        trim    : true,
        match   : [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      },
      phone  : {
        type    : String,
        required: [true, "Phone number is required"],
        trim    : true,
      },
      address: { type: String, default: "" },
    },

    // ── Project Requirements
    requirements: {
      type    : String,
      required: [true, "Project requirements are required"],
      maxlength: [2000, "Requirements cannot exceed 2000 characters"],
    },

    // Budget
    budget: {
      amount  : { type: Number, default: 0 },
      currency: { type: String, default: "BDT" },
    },

    // Deadline
    deadline: {
      type   : Date,
      default: null,
    },

    // ── Order Status Flow:
    // pending → confirmed → in-progress → review → completed
    //                     ↘ cancelled
    status: {
      type   : String,
      enum   : [
        "pending",
        "confirmed",
        "in-progress",
        "review",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    // ── Priority
    priority: {
      type   : String,
      enum   : ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    // ── Admin Notes
    adminNote: {
      type   : String,
      default: "",
    },

    // ── Status History (Timeline)
    statusHistory: [
      {
        status   : { type: String },
        note     : { type: String, default: "" },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // ── Payment
    payment: {
      status : {
        type   : String,
        enum   : ["unpaid", "partial", "paid"],
        default: "unpaid",
      },
      method  : { type: String, default: "" }, // bKash, Nagad, Bank
      amount  : { type: Number, default: 0 },
      paidAt  : { type: Date,   default: null },
      transactionId: { type: String, default: "" },
    },

    // ── Completion
    completedAt: {
      type   : Date,
      default: null,
    },

    // ── Handled By
    assignedTo: {
      type   : mongoose.Schema.Types.ObjectId,
      ref    : "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ─────────────────────────────────────────
//   Pre-save: Generate Order ID
// ─────────────────────────────────────────
orderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  // Format: ORD-20240615-0001
  const today    = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count    = await mongoose.model("Order").countDocuments();
  this.orderId   = `ORD-${datePart}-${String(count + 1).padStart(4, "0")}`;

  // Initial status history
  this.statusHistory.push({
    status   : "pending",
    note     : "Order placed successfully",
    changedAt: new Date(),
  });

  next();
});

// ─────────────────────────────────────────
//   Method: Update Status with History
// ─────────────────────────────────────────
orderSchema.methods.updateStatus = async function (newStatus, note = "", adminId = null) {
  this.status = newStatus;
  this.statusHistory.push({
    status   : newStatus,
    note,
    changedBy: adminId,
    changedAt: new Date(),
  });

  if (newStatus === "completed") {
    this.completedAt = new Date();
  }

  await this.save();
};

// ─────────────────────────────────────────
//   Indexes
// ─────────────────────────────────────────
orderSchema.index({ orderId   : 1  });
orderSchema.index({ status    : 1  });
orderSchema.index({ user      : 1  });
orderSchema.index({ service   : 1  });
orderSchema.index({ createdAt : -1 });

module.exports = mongoose.model("Order", orderSchema);
