const { Telegraf } = require("telegraf");
const config = require("../config/default");
const BotUser = require("../models/botUser");

let token = config.dev.botToken;
let ExpensesBot = new Telegraf(token);

ExpensesBot.start(async (ctx) => {  
    console.log('bot start pressed by: '+ctx.from.username)
    let user = await BotUser.findOne({ chat_id: ctx.chat.id });
   
    if(!user){
        const newUser = {
            chat_id: ctx.chat.id,
            username: ctx.from.username
        };

        user = new BotUser(newUser);
        user.save((err, saved) => {
            if(err) console.log(err, ' ,error in telegram/index.js');
            if (saved) console.log('user saved');
        });

        ExpensesBot.telegram.sendMessage(ctx.chat.id, 'Здравствуйте. Представьтесь, пожалуйста :) (отправьте мне фамилию и имя одним сообщением, например: Валиева Насиба )');
    }else if(user.step === 3){
        if(user.role ==='admin'){
            ExpensesBot.telegram.sendMessage(ctx.chat.id, 'Выберите действие:',
            {"reply_markup": JSON.stringify({
                "keyboard": [
                    [{ text: "Запросить сумму"}],
                    [{ text: "Посмотреть свою историю"}],
                    [{ text: "Все расходы"}]
                ],
                "one_time_keyboard" : true,
                "resize_keyboard" : true
            })}
            );
        }else{
            ExpensesBot.telegram.sendMessage(ctx.chat.id, 'Выберите действие:',
            {"reply_markup": JSON.stringify({
                "keyboard": [
                    [{ text: "Запросить сумму"}],
                    [{ text: "Посмотреть свою историю"}]
                ],
                "one_time_keyboard" : true,
                "resize_keyboard" : true
            })}
            );
        }

        // ExpensesBot.telegram.sendMessage(ctx.chat.id, 'Выберите действие: ',
        // // {
        // //     reply_markup: JSON.stringify({
        // //     remove_keyboard: true
        // //     })
        // // }
        // {"reply_markup": JSON.stringify({
        //     "keyboard": [
        //         [{ text: "Запросить сумму"}],
        //         [{ text: "Посмотреть историю"}]
        //     ],
        //     "one_time_keyboard" : true
        // })}
        // );
    }
});

ExpensesBot.help(async (ctx) => {  
    console.log('bot start pressed by: '+ctx.from.username)
    let user = await BotUser.findOne({ chat_id: ctx.chat.id });
   
    if(user.step === 0 ||user.step === 1 || user.step === 2){
        ExpensesBot.telegram.sendMessage(ctx.chat.id, 'Для начала пройдите регистрацию и ответьте на предыдущий вопрос 👆');
    }else{
        ExpensesBot.telegram.sendMessage(ctx.chat.id, 'Нажмите /start и вам выйдет список команд.')
    }
});

ExpensesBot.launch()


module.exports = {
    ExpensesBot
};