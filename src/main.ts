import { MachineConfig, send, assign, Action } from "xstate";

//import { dmMachine, say, listen } from "./dmAppointment";
import { dmMachine } from "./dmColourChanger";
import { say, listen } from "./dmAppointment";

function promptAndAsk(prompt: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
	initial: 'prompt',
	states: {
            prompt: {
		entry: say(prompt),
		on: { ENDSPEECH: 'ask' }
            },
            ask: {
		entry: send('LISTEN'),
            },
	}})
}

const proxyurl = "https://cors-anywhere.herokuapp.com/";
const rasaurl = 'https://appointmentofpanic.herokuapp.com/model/parse'
export const nluRequest = (text: string) =>
    fetch(new Request(proxyurl + rasaurl, {
        method: 'POST',
        headers: { 'Origin': 'http://maraev.me' }, // only required with proxy
        body: `{"text": "${text}"}`
    }))
        .then(data => data.json());

export const dmMain: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
	welcome: {
	    on: {
		RECOGNISED: {
		    target: 'invocation',
		    actions: assign((context) => { return { utterance: context.recResult } }),
                }
            },
	    ...promptAndAsk("What would you like to do?")
	},
	invocation: {
	    invoke: {
		id: 'whatever',
                src: (context, event) => nluRequest(context.utterance),
                onDone: {
                    target: 'choose',
                    actions: [assign((context, event) => { return {rasa_guess: event.data.intent.name }}),
			      (context:SDSContext, event:any) => console.log(event.data)]
                },
		onError: {
                    target: 'welcome',
		    actions: (context,event) => console.log(event.data)
                }
            }
	},
    choose: {
        entry: send('RECOGNISED'),
        on: {
            RECOGNISED: [
                { target: 'appointment', cond: (context) => context.rasa_guess === "appointment" },
                { target: 'todo', cond: (context) => context.rasa_guess === "TODO_list" },
                { target: 'timer', cond: (context) => context.rasa_guess === "timer" },
            ]
        },
    },
    appointment: {
        ...dmMachine
    },
    todo: {
        initial: "prompt",
        states: {
            prompt: { entry: say("Let's write a todo list") }
        }
    },
    timer: {
        initial: "prompt",
        states: {
            prompt: { entry: say("Let's set a timer") }
        }}
    }})
