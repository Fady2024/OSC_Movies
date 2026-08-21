import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import {
  transformId,
  composeTransforms,
  softDeletePlugin,
  auditPlugin,
  type SoftDeleteStatics,
  type AuditFields,
} from "@/common/mongoose";

export interface IUser extends Document, AuditFields {
  fullName: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  notifyNewMovies: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  deletedAt?: Date | null;
  deletedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    notifyNewMovies: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: composeTransforms(transformId, (_doc, ret) => {
        delete ret.password;
      }),
    },
  }
);

userSchema.plugin(softDeletePlugin);
userSchema.plugin(auditPlugin);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser, SoftDeleteStatics<IUser>>("User", userSchema);
