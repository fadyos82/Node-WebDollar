const EventEmitter = require('events');

class AdvancedEmitter{

    constructor(maxListeners = 100){

        this._emitter = new EventEmitter();
        this._emitter.setMaxListeners(maxListeners);

        this._events = this._emitter._events;

        this.emit = this._emitter.emit.bind(this._emitter);

        this.emitter = this._emitter;

    }

    emit(){

        let answer;
        try{
            answer = this._emitter.emit.apply(this, arguments);
        } catch (exception){
            console.error("Emit raised an error", exception);
        }

        return answer;
    }

    on(a, call){

        this._emitter.on(a, call);

        return ()=> this._emitter.removeListener(a, call);
    }

    once(a, call){

        this._emitter.once(a, call);

        return () => this._emitter.removeListener(a, call);
    }

}

export default AdvancedEmitter;