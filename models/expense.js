const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
{
    id: {
        type: Number,
        required: true,
    },
    chat_id: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      default: '',
    },
    subtype: {
        type: String,
        default: '',
    },
    name: {
        type: String,
        default: '',
    },
    price: {
        type: String,
        default: '',
    },
    accepted: {
        type: Boolean,
        default: false,
    },
    comment: {
        type: String,
        default: '',
    },
    step:{
        type: Number,
        default: 0,
    },
    refuse_comment:{
        type: String,
        default: '',
    },
    status:{
        type: String,
        default: 'waiting',
    },
    state:{
        type: String,
        default: 'active',
    },

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("expense", ExpenseSchema);
