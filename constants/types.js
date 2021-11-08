module.exports = [
    {
        id:'ofis',
        name:'Для офиса',
    },
    {
        id:'letostore',
        name:'Letostore',
        sub_types:[
            {
                id:'letostore_sub1',
                name:'Закуп товара',
                explanation:'Покупка товаров у поставщиков'
            },
            {
                id:'letostore_sub2',
                name:'Необходимые расходы',
                explanation:'Оплата парковки, доставок и др. важных вещей'
            },
            {
                id:'letostore_sub3',
                name:'Дебильные расходы',
                explanation:'Покупка отзывов, подарки клиентам которые сделали возврат или недовольны чем-то и другие расходы, которые можно было избежать'
            },
        ]
    },
    {
        id:'projects_improvement',
        name:'Развитие проектов',
        sub_types:[
            {
                id:'proj_imp_sub1',
                name:'Связь',
                // explanation:'Покупка товаров у поставщиков'
            },
            {
                id:'proj_imp_sub2',
                name:'Оплата з.п.',
                // explanation:'Оплата парковки, доставок и др. важных вещей'
            },
            {
                id:'proj_imp_sub3',
                name:'Другое',
                // explanation:'Покупка отзывов, подарки клиентам которые сделали возврат или недовольны чем-то и другие расходы, которые можно было избежать'
            },
        ]
    },
    {
        id:'travel_agency',
        name:'Travel- агентство',
    },
    {
        id:'carfastbot',
        name:'Carfastbot',
    },
    {
        id:'carfast',
        name:'Carfast',
    },
    {
        id:'rustam',
        name:'Для Рустама',
        sub_types:[
            {
                id:'rustam_sub1',
                name:'З.п. Григорию',
                // explanation:'Покупка товаров у поставщиков'
            },
            {
                id:'rustam_sub2',
                name:'Другое',
                // explanation:'Оплата парковки, доставок и др. важных вещей'
            },
        ]
    },
]