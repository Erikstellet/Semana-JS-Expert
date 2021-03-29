import ComponentBuilder from './components.js'

export default class TerminalController
{
    constructor() { }
    
    #onInputReceived(eventEmitter)
    {
        return function ()
        { 
           const message = this.getValue();
           console.log(message);
           this.clearValue();
        }
    }

    async initializeTable(eventEmitter)
    {
        const components = new ComponentBuilder()
            .setScreen({ title: '- Erik Chat -' })
            .setLayoutComponent()
            .setInputComponent(this.#onInputReceived(eventEmitter))  
            .build();

          components.input.focus();
          components.screen.render();
    }
}