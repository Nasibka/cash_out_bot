const BotUser = require("../models/botUser");
const EXPENSE = require("../models/expense");
const { ExpensesBot } = require("./index");
const { sendMessage, formatter } = require("../helpers/bot");
const extra = require('telegraf/extra')
const markup = extra.HTML()

ExpensesBot.action('allow', async(ctx) => {
    const name = ctx.callbackQuery.message.text.split('\n')[0].split(':')[1].trim()
    const exp_name = ctx.callbackQuery.message.text.split('\n')[1].split(':')[1].trim()
    const exp_id = ctx.callbackQuery.message.text.split('\n')[7].split(':')[1].trim()
    const user = await BotUser.findOne({ name: name });

    // console.log(exp_id,16)
    if(user){
        const exp = await EXPENSE.find({ id: exp_id, status: 'waiting', state: 'active'}).sort({"createdAt": -1}).limit(1);
        const expense = exp[0]
        if(expense){
            expense.status = 'confirmed'
            expense.state = 'not_active'
            expense.accepted = true
            expense.save()
            sendMessage(user.chat_id,'Вам разрешено купить <b>'+exp_name + '</b> за '+
            '<b>'+formatter.format(parseInt(expense.price),100000).replace(/,/g, " ")+' тг.</b>\
            \n <b>ID: </b>'+expense.id
            //  'Когда получите чек выберите этот запрос и нажмите отчитаться. Потом отправьте фотографию или скрин чека'
            ,markup) 
            ctx.reply('Я все передала 👌')
        }
        

    }
})

ExpensesBot.action('not_allow', async(ctx) => {
    const name = ctx.callbackQuery.message.text.split('\n')[0].split(':')[1].trim()
    const exp_name = ctx.callbackQuery.message.text.split('\n')[1].split(':')[1].trim()
    const exp_id = ctx.callbackQuery.message.text.split('\n')[7].split(':')[1].trim()
    const user = await BotUser.findOne({ name: name });

    if(user){
        const admin = await BotUser.findOne({ chat_id: ctx.chat.id })
        admin.action = 'waitingRefuse'
        admin.save()

        const exp = await EXPENSE.find({ id: exp_id, status: 'waiting', state: 'active',}).sort({"createdAt": -1}).limit(1);
        const expense = exp[0]
        console.log(expense)
        if(expense){
            expense.status = 'waiting_refuse'
            expense.save()
            ctx.reply('Почему нельзя купить '+ exp_name+' ?')
        }
    }
})

