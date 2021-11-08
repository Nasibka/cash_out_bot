const { ExpensesBot } = require("../telegram/index");

const inlineKeyboard = (buttons, html) => {
  let value = {
    reply_markup: JSON.stringify({
      inline_keyboard: buttons,
      resize_keyboard: true,
    }),
  };
  if (html) {
    value = {
      ...value,
      parse_mode: "HTML",
    };
  }
  return value;
};

const keyboard = (buttons, html) => {
  let value = {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
    },
  };
  if (html) {
    value = {
      ...value,
      parse_mode: "HTML",
    };
  }
  return value;
};

const sendMessage = (chat_id, message, messageKeyboard) => {
  return ExpensesBot
    .telegram
    .sendMessage(chat_id, message, messageKeyboard)
    .then(() => {
      return true;
    })
    .catch(async (err) => {
        console.log(err)
        console.log(err && err.response && err.response.statusCode ? err.response.statusCode : "no status", chat_id)
      return err;
    });
};

//используем для красивого вывода цены с пробелами в боте
const formatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  minimumFractionDigits: 0,
});

// const delay = (ms) => new Promise((res) => setTimeout(res, ms));


module.exports = {
  inlineKeyboard,
  keyboard,
  sendMessage,
  formatter
};
