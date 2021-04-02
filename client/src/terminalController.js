import ComponentBuilder from './components.js'
import { constants } from './constants.js'

export default class TerminalController
{
    #usersCollors = new Map();

    constructor() { }

    #pickCollor()
    {
        const randomBinary = (((1 << 24) * Math.random() | 0)).toString(16);

        return `#${randomBinary}-fg`;
    }

    #getUserCollor(userName)
    {
        if(this.#usersCollors.has(userName)) 
        {
            return this.#usersCollors.get(userName);
        }
        else
        {
            const collor = this.#pickCollor();
            this.#usersCollors.set(userName, collor);

            return collor;
        }
    }
    
    #onInputReceived(eventEmitter)
    {
        return function ()
        { 
           const message = this.getValue();
           this.clearValue();
        }
    }

    #onMessageReceived({ screen, chat })
    {
        return (msg) => 
        {
            const { userName, message } = msg;
            const collor = this.#getUserCollor(userName);

            chat.addItem(`{${collor}}{bold}${ userName }{/}: ${ message }`);
            screen.render();
        }
    }

    #onLogChanged({ screen, activityLog })
    {
        return msg => 
        {
            const [userName] = msg.split(/\s/);
            const collor = this.#getUserCollor(userName);

            activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`);
            screen.render();
        }
    }

    #onStatusChanged({ screen, status })
    {
        return users => 
        {
            const { content } = status.items.shift();
            
            status.clearItems();
            status.addItem(content);

            users.forEach(userName =>
            {
                const collor = this.#getUserCollor(userName);
                status.addItem(`{${collor}}{bold}${userName}{/}`);
            })

            screen.render()
        }
    }

    #registerEvents(eventEmitter, components)
    {
        eventEmitter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components));
        eventEmitter.on(constants.events.app.ACTIVITYLOG_UPDATED, this.#onLogChanged(components));
        eventEmitter.on(constants.events.app.STATUS_UPDATED, this.#onStatusChanged(components));
    }

    async initializeTable(eventEmitter)
    {
        const components = new ComponentBuilder().setScreen({ title: '- Erik Chat -' })
                                                 .setLayoutComponent()
                                                 .setInputComponent(this.#onInputReceived(eventEmitter))
                                                 .setChatComponent()
                                                 .setActivityLogComponent() 
                                                 .setStatusComponent() 
                                                 .build();

        this.#registerEvents(eventEmitter, components)  
        components.input.focus();
        components.screen.render();

       setInterval(() => 
       {
            const users = ['Erik'];

            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
            users.push('Bianca');

            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
            users.push('Beatriz');

            eventEmitter.emit(constants.events.app.STATUS_UPDATED, users);
            users.push('Ana');
        },  2000);
    }
}