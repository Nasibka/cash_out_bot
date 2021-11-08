module.exports = {
    yes_no : [[{text:"Да",callback_data:'yes'},{text:"Нет",callback_data:'no'}]],
    allowOrNot : [[{text:"Можно",callback_data:'allow'},{text:"Нельзя",callback_data:'not_allow'}]],
    action : [[{text:"Запросить сумму",callback_data:'add_expense'},{text:"Посмотреть историю",callback_data:'history'}]],
    types_of_exp : [[{text:"Для офиса",callback_data:'type1'}],[{text:"Letostore",callback_data:'type2'}],
    [{text:"Развитие проектов",callback_data:'type3'}],[{text:"Travel- агентство",callback_data:'type4'}],
    [{text:"Carfastbot",callback_data:'type5'}],[{text:"Carfast",callback_data:'type6'}],
    [{text:"Для Рустама",callback_data:'type7'}]]
}