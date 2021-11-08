const EXPENSE = require("../models/expense");
const BotUser = require("../models/botUser");
const { formatter } = require("../helpers/bot");
const config = require("../config/default");
const ExcelJS = require('exceljs');
const fs = require('fs');
const request = require('request')
const token = config.dev.botToken;

async function getArrayOfExpenses(chat_id){
    const expenses = await EXPENSE.find({ chat_id: chat_id })
    let array = []
    expenses.forEach((expense,index)=>{
        let status
        if(expense.status==='refused'){ status = 'Отказано' }
        else if(expense.status==='confirmed'){ status = 'Подтверждено' }
        else if(expense.status==='waiting'){ status = 'Ожидается' }

        subtypeString = expense.subtype!='' ? expense.subtype : 'Нет'
        array.push('<b>ID:</b> <i>'+expense.id+'</i>\
        \n<b>Затраты на:</b> <i>'+expense.name+'</i>\
        \n<b>Стоимость:</b> <i>'+formatter.format(parseInt(expense.price),100000).replace(/,/g, " ") +' ₸</i>\
        \n<b>Вид затрат:</b> <i>'+expense.type+' </i>\
        \n<b>Подкатегория затрат:</b> <i>'+subtypeString+' </i>\
        \n<b>Комментарий:</b> <i>'+expense.comment+'</i>\
        \n<b>Статус:</b> <i>'+status+'</i>\
        \n<b>Страница:</b> <i>'+(index+1)+'</i>')
    })
    return array
}

async function sendXSLX(ctx,gt,lt){
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('My Sheet');
    sheet.state = 'visible';

    sheet.columns = [
        { header: 'Id', key: 'id', width: 6 },
        { header: 'Категория', key: 'type', width: 20 },
        { header: 'Подкатегория', key: 'subtype', width: 20, outlineLevel: 3 },
        { header: 'Имя', key: 'name', width: 20 },
        { header: 'Расход', key: 'exp_name', width: 20 },
        { header: 'Для чего', key: 'comment', width: 20 },
        { header: 'Сумма', key: 'price', width: 10 },
        { header: 'Дата', key: 'date', width: 10 },
    ];

    console.log(new Date(gt).toISOString())

    const expenses = await EXPENSE.find({status:'confirmed',
    createdAt: {
        $gte: gt+"T00:00:00.000Z",
        $lte: lt+"T00:00:00.000Z"
    }}).sort({type:1})

    for(exp of expenses){
        const name = await BotUser.findOne({chat_id:exp.chat_id})
        const date = exp.createdAt.getDate()+"."+(exp.createdAt.getMonth()+1)+"."+exp.createdAt.getFullYear()
        await sheet.addRow([exp.id, exp.type, exp.subtype, name.name, exp.name, exp.comment, exp.price, date]);
    }

    await workbook.xlsx.writeFile('расходы.xlsx');
 
    const url = 'https://api.telegram.org/bot'+token+'/sendDocument'
    let r = request(url, (err, res, body) => {
        if(err) console.log(err)
        // console.log(body)
    })
    
    let f = r.form()
    f.append('chat_id', ctx.chat.id)
    f.append('document', fs.createReadStream('расходы.xlsx'))    
}

module.exports = {
    getArrayOfExpenses,
    sendXSLX
}