const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
{
    chat_id: {
      type: Number,
      required: true,
    },
    username:{
      type: String,
      default:''
    },
    name: {
      type: String,
      default:''
    },
    phone: {
      type: String,
      default:''
    },
    position: {
        type: String,
        default:''
    },
    role: {
      type: String,
      default:'user'
    },
    action:{
      type: String,
      default:'none'
    },
    step: {
      type: Number,
      default: 0,
    },
    registered:{
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", UserSchema);
