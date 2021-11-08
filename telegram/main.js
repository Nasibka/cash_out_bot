const BotUser = require("../models/botUser");
const EXPENSE = require("../models/expense");
const { ExpensesBot } = require("./index");
const { sendMessage, inlineKeyboard,formatter } = require("../helpers/bot");
const extra = require('telegraf/extra')
const markup = extra.HTML()
const types = require("../constants/types");
const kboard = require("../constants/keyboard");
const {getArrayOfExpenses,sendXSLX} =require("../controllers/mainBotFunctions")

const type_regex = /type\d$/;
const subtype_regex = /[A-Za-z]+_sub\d$/;

// const admin_chat_id = 287016579
const admin_chat_id = 78923920


ExpensesBot.hears('Все расходы', async(ctx) => {
    // sendXSLX(ctx)
    const admin = await BotUser.findOne({ chat_id: ctx.chat.id });
    if(admin){
        console.log(admin)
        admin.action = 'getExpenses'
        admin.save()
        sendMessage(ctx.chat.id,'Отправьте период (пример: 01.02.2021-24.02.2021 )')
    }
})

ExpensesBot.hears('Посмотреть свою историю', async(ctx) => {
    const user = await BotUser.findOne({ chat_id: ctx.chat.id });
    user.action = '';
    user.save();
    let array = await getArrayOfExpenses(ctx.chat.id)
    const expense = array[0]
    sendMessage(ctx.chat.id,expense,inlineKeyboard([[{text:">",callback_data:'>'},{text:">>",callback_data:'>>'}]],true))

})

ExpensesBot.hears('Запросить сумму', async(ctx) => {
    const user = await BotUser.findOne({ chat_id: ctx.chat.id });
    
    if(user){
        user.action = 'makeRequest'
        user.save()
        sendMessage(ctx.chat.id,'К какой категории относится этот расход?',inlineKeyboard(kboard.types_of_exp))
    }

})

ExpensesBot.on('text', async(ctx) => {
    const user = await BotUser.findOne({ chat_id: ctx.chat.id });
    if(user){
        if(user.registered===false){
            //проверка правильности написания
            switch(user.step){
                case 0:
                    user.name = ctx.message.text
                    user.save();
                    sendMessage(ctx.chat.id,ctx.message.text+', проверьте правильно ли Вы написали свое имя?',inlineKeyboard(kboard.yes_no))
                    break;
                case 2:
                    user.position = ctx.message.text
                    user.save();
                    sendMessage(ctx.chat.id,ctx.message.text+', проверьте правильно ли Вы написали свою должность?',inlineKeyboard(kboard.yes_no))
                    break;
            }
        }else{
            switch(user.action){
                case 'waitingRefuse':
                    const waiting_refuse = await EXPENSE.findOne({ state:'active',status:'waiting_refuse' });
                    if(waiting_refuse){
                        console.log(waiting_refuse,77)
                        waiting_refuse.refuse_comment = ctx.message.text
                        waiting_refuse.status = 'refused'
                        waiting_refuse.state = 'not_active'
                        waiting_refuse.save()
                        sendMessage(admin_chat_id,'Я все передала 👌')
                        sendMessage(waiting_refuse.chat_id,'Извините, но Ваш запрос на <b>'+waiting_refuse.name+ '</b> был отклонен Рустамом. '+
                        '\n<b>ID: </b>'+waiting_refuse.id+
                        '\n<b>Причина: </b>'+waiting_refuse.refuse_comment,
                        markup)
                    } 
                    user.action = ''
                    user.save()
                    break;
                
                case 'getExpenses':
                    let [first,second] = ctx.message.text.split('-')
                    const gt = first.split('.')[2]+"-"+first.split('.')[1]+"-"+first.split('.')[0]
                    const lt = second.split('.')[2]+"-"+second.split('.')[1]+"-"+second.split('.')[0]
                    sendXSLX(ctx,gt,lt)
                    user.action = ''
                    user.save()
                    break;
                
                case 'makeRequest':
                    const exp = await EXPENSE.find({ chat_id: ctx.chat.id,state:'active',status: 'waiting' }).sort({"createdAt": -1}).limit(1);
                    const expense = exp[0]
                    if(expense){
                        switch(expense.step){
                            case 0:
                                expense.name = ctx.message.text
                                expense.step = 1
                                expense.save();
                                sendMessage(ctx.chat.id,'Зачем нам это надо?')
                                break;
                            case 1:
                                expense.comment = ctx.message.text
                                expense.step = 2
                                expense.save();
                                sendMessage(ctx.chat.id,'Напишите сумму. (Писать только цифрами, без пробелов и без тг. или KZT)')
                                break;
                            case 2:
                                expense.price = ctx.message.text
                                expense.step = 3
                                expense.save();
                                let subtypeString
                                if(expense.subtype!=''){
                                    subtypeString = expense.subtype
                                }else{
                                    subtypeString = 'Нет'
                                }
    
                                sendMessage(ctx.chat.id,'Отлично, я сообщу когда Рустам рассмотрит ваш запрос. Ожидайте. \nID вашего запроса: '+expense.id)
                                sendMessage(admin_chat_id,' Пришел запрос от: <b>'+user.name +'</b>\
                                    \n<b>Затраты на:</b> <i>'+expense.name+'</i>\
                                    \n<b>Стоимость:</b> <i>'+formatter.format(parseInt(expense.price),100000).replace(/,/g, " ") +' ₸</i>\
                                    \n<b>Вид затрат:</b> <i>'+expense.type+' </i>\
                                    \n<b>Подкатегория затрат:</b> <i>'+subtypeString+' </i>\
                                    \n<b>Должность:</b> <i>'+user.position+' </i>\
                                    \n<b>Комментарий:</b> <i>'+expense.comment+'</i>\
                                    \n<b>ID:</b> <i>'+expense.id+'</i>'
                                , inlineKeyboard(kboard.allowOrNot,true))

                                break;
                            case 3:
                                sendMessage(ctx.chat.id,'Ваш запрос все еще обрабатывается. Подождите еще немного :)')
                                break;
                        }
                    }        
                    break;
            }
        }
    }
    
})

ExpensesBot.on('contact', async(ctx) => {
    const user = await BotUser.findOne({ chat_id: ctx.chat.id });
    if(user){
        if(user.registered===false){
            switch(user.step){
                case 1:
                    user.phone = ctx.message.contact.phone_number
                    user.step = 2
                    user.save();
                    sendMessage(ctx.chat.id,'Прекрасно. Напишите Вашу должность в компании',
                    {
                        reply_markup: JSON.stringify({
                        remove_keyboard: true
                        })
                    })
                    break;
                }
            }
        }
})

ExpensesBot.action('yes', async(ctx) => {
    const user = await BotUser.findOne({ chat_id: ctx.chat.id });

    if(user && user.registered===false){
        switch(user.step){
            case 0:
                user.step = 1
                user.save();
                ctx.telegram.sendMessage(ctx.chat.id,'Отлично, теперь поделитесь Вашим номером телефона.',
                {"reply_markup": JSON.stringify({
                    "keyboard": [
                        [{ text: "Поделиться номером", request_contact: true }]
                    ],
                    "one_time_keyboard" : true
                })}
                )
                break;
            case 2:
                user.step = 3
                user.registered = true
                user.save();
                if(ctx.chat.id != admin_chat_id){
                    sendMessage(ctx.chat.id,'Поздравляю, Вы успешно зарегестрировались! Что вы хотите сделать?',
                    {"reply_markup": JSON.stringify({
                        "keyboard": [
                            [{ text: "Запросить сумму"}],
                            [{ text: "Посмотреть историю"}]
                        ],
                        "one_time_keyboard" : true,
                        "resize_keyboard" : true
                    })})  
                }else{
                    sendMessage(ctx.chat.id,'Поздравляю, Вы успешно зарегестрировались!')
                }
                break;
        }
    }
})

ExpensesBot.action('no', async(ctx) => {
    const user = await BotUser.findOne({ chat_id: ctx.chat.id });

    if(user && user.registered===false){
        switch(user.step){
            case 0:
                sendMessage(ctx.chat.id,'Напишите еще раз:')
                break;
            case 1:
                sendMessage(ctx.chat.id,'Напишите еще раз:')
                break;
            case 2:
                sendMessage(ctx.chat.id,'Напишите еще раз:')
                break;
        }
    }
})

ExpensesBot.action(type_regex, async(ctx) => {
    const type = kboard.types_of_exp.flat(1).find(({callback_data}) => callback_data === ctx.callbackQuery.data)
    // console.log(ctx.callbackQuery.data,203)
    // console.log(type) 
    const found = types.find(({name})=>name === type.text)
    // console.log(found)
    if(found){

        let exp = await EXPENSE.find({}).sort({"_id": -1}).limit(1);
        if(exp.length!=0){
            // console.log(exp,209)
            const increment = exp[0].id+1
            const newExp = {
                chat_id: ctx.chat.id,
                type: type.text,
                id: increment
            };
            exp = new EXPENSE(newExp);
            exp.save((err, saved) => {
                if(err) console.log(err, ' ,error in telegram/main.js');
                if (saved) {
                    console.log(increment+ ' exp id saved');
                }
            });
        }
        //only if there is no exp and this is the first one
        else{
            const newExp = {
                chat_id: ctx.chat.id,
                type: type.text,
                id:0
            };
            exp = new EXPENSE(newExp);
            exp.save((err, saved) => {
                if(err) console.log(err, ' ,error in telegram/main.js');
                if (saved) {
                    console.log('exp saved');
                }
            });
        }
        
        if(found.sub_types){
            let subtype_buttons = []
            found.sub_types.forEach(el =>{
                subtype_buttons.push([{text:el.name,callback_data:el.id}])
            })
            
            sendMessage(ctx.chat.id,'Выберите подкатегорию:',inlineKeyboard(subtype_buttons));

        }else{
            sendMessage(ctx.chat.id,'Окей, а что именно Вам нужно купить?');
        }
    }
})

ExpensesBot.action(subtype_regex, async(ctx) => {
    let sub_type
    // types.forEach(el=>{
    //     if(el.sub_types){
    //         console.log(el.sub_types)
    //         sub_type = el.sub_types.find(({id})=>id===ctx.callbackQuery.data)
    //     }
    // })
    for(let type of types){
        if(type.sub_types){
            sub_type = type.sub_types.find(({id})=>id===ctx.callbackQuery.data)
            if(sub_type!==undefined){
                break
            }
        }
    }
    let exp = await EXPENSE.find({}).sort({"_id": -1}).limit(1);
    exp[0].subtype = sub_type.name
    exp[0].save((err, saved) => {
        if(err) console.log(err, ' ,error in telegram/main.js');
        if (saved) {
            console.log(saved,256);
        }
    });
    sendMessage(ctx.chat.id,'Окей, а что именно Вам нужно купить?')
})

ExpensesBot.action('>', async(ctx) => {
    const page_index = ctx.callbackQuery.message.text.split('\n')[7].split(':')[1].trim()
    let array = await getArrayOfExpenses(ctx.chat.id)
    if(array.length !== parseInt(page_index)+1){
        const expense = array[page_index]
        ExpensesBot.telegram.editMessageText(ctx.chat.id,ctx.callbackQuery.message.message_id,null,expense,inlineKeyboard([[{text:"<<",callback_data:'<'},{text:"<",callback_data:'<'},{text:">",callback_data:'>'},{text:">>",callback_data:'>>'}]],true))
        .then(() => {
            return true;
        })
        .catch(async (err) => {
            console.log(err)
        });
    }else{
        const expense = array[page_index]
        ExpensesBot.telegram.editMessageText(ctx.chat.id,ctx.callbackQuery.message.message_id,null,expense,inlineKeyboard([[{text:"<<",callback_data:'<'},{text:"<",callback_data:'<'}]],true))
        .then(() => {
            return true;
        })
        .catch(async (err) => {
            console.log(err)
        });
    }    
})

ExpensesBot.action('<', async(ctx) => {
    const page_index = ctx.callbackQuery.message.text.split('\n')[7].split(':')[1].trim()
    let array = await getArrayOfExpenses(ctx.chat.id)
    if(page_index != 2){
        const expense = array[page_index-2]
        ExpensesBot.telegram.editMessageText(ctx.chat.id,ctx.callbackQuery.message.message_id,null,expense,inlineKeyboard([[{text:"<<",callback_data:'<<'},{text:"<",callback_data:'<'},{text:">",callback_data:'>'},{text:">>",callback_data:'>>'}]],true))
        .then(() => {
            return true;
        })
        .catch(async (err) => {
            console.log(err)
        });
    }else{
        const expense = array[0]
        ExpensesBot.telegram.editMessageText(ctx.chat.id,ctx.callbackQuery.message.message_id,null,expense,inlineKeyboard([[{text:">",callback_data:'>'},{text:">>",callback_data:'>>'}]],true))
        .then(() => {
            return true;
        })
        .catch(async (err) => {
            console.log(err)
        });
    }    
})

ExpensesBot.action('>>', async(ctx) => {
    let array = await getArrayOfExpenses(ctx.chat.id)
    const expense = array[array.length-1]
    ExpensesBot.telegram.editMessageText(ctx.chat.id,ctx.callbackQuery.message.message_id,null,expense,inlineKeyboard([[{text:"<<",callback_data:'<<'},{text:"<",callback_data:'<'}]],true))
    .then(() => {
        return true;
    })
    .catch(async (err) => {
        console.log(err)
    });
})

ExpensesBot.action('<<', async(ctx) => {
    let array = await getArrayOfExpenses(ctx.chat.id)
    const expense = array[0]
    ExpensesBot.telegram.editMessageText(ctx.chat.id,ctx.callbackQuery.message.message_id,null,expense,inlineKeyboard([[{text:">>",callback_data:'>>'},{text:">",callback_data:'>'}]],true))
    .then(() => {
        return true;
    })
    .catch(async (err) => {
        console.log(err)
    });
})
