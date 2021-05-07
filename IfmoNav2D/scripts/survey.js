Survey
    .StylesManager
    .applyTheme("modern");

var json = {
    surveyPostId: "cf3e2271-bd04-401a-9d91-d7d93ca0ed69",
    showProgressBar: "none",
    firstPageIsStarted: true,
    showPrevButton: false,
    showTimerPanel: "bottom",
    showTimerPanelMode: "none",
    startSurveyText: "Начать",
    pages: [
        {
            questions: [
                {
                    type: "html",
                    html: "Приветствую! Вы поможете мне приблизиться к завершению магистерской диссертации, если пройдёте этот опрос.<br>Прочитайте и выполните задания связанные с нахождением маршрута.<br>Если вы затрудняетесь выполнить задание - нажмите 'Далее'.<br><br>"
                }
            ]
        },
        {
            name: "room141",
            questions: [
                {
                    type: "text",
                    name: "room141",
                    title: "Найдите маршрут до аудитории 141",
                    defaultValue: "Затрудняюсь",
                }
            ]
        },
        {
            name: "room262",
            questions: [
                {
                    type: "text",
                    name: "room262",
                    title: "Найдите маршрут до аудитории 262",
                    defaultValue: "Затрудняюсь",
                }
            ]
        },
        {
            name: "groupP4171",
            questions: [
                {
                    type: "text",
                    name: "groupP4171",
                    title: "Для группы P4171 найдите где будут проводиться занятия в 15:00 (маршрут)",
                    defaultValue: "Затрудняюсь",
                }
            ]
        },
        {
            name: "teacher",
            questions: [
                {
                    type: "text",
                    name: "teacher",
                    title: "Где проводит занятия преподаватель Саркисова в 11:40? (маршрут)",
                    defaultValue: "Затрудняюсь",
                }
            ]
        },
        {
            name: "place",
            questions: [
                {
                    type: "text",
                    name: "place",
                    title: "Где находится кафедра ФПИиКТ? (маршрут)",
                    defaultValue: "Затрудняюсь",
                }
            ]
        },
        {
            questions: [
                {
                    type: "rating",
                    name: "easy",
                    title: "Я считаю что интерфейс прост в использовании",
                    minRateDescription: "Нет",
                    maxRateDescription: "Да",
                    isRequired: true
                },
            ]
        },
        {
            questions: [
                {
                    type: "rating",
                    name: "likeIt",
                    title: "Мне нравится этот интерфейс",
                    minRateDescription: "Нет",
                    maxRateDescription: "Да",
                    isRequired: true
                }
            ]
        }
    ],
    completedHtml: "<h4>Благодарим за участие в опросе.</h4>"
};

window.survey = new Survey.Model(json);

survey
    .onComplete
    .add(function (result) {
        // ym(68181040,'reachGoal','clickfinish3d');
        // gtag('event', 'finish3d');
    });

survey.locale = 'ru';

$("#survey-element").Survey({ model: survey });