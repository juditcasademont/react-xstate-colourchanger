import { Action, Machine, assign, send, actions, State, MachineConfig } from "xstate";
const {cancel} = actions

export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

function promptAndAskAndNomatch(prompt: string): MachineConfig<SDSContext, any, SDSEvent> {
    return ({
	initial: 'prompt',
	states: {
            prompt: {
		entry: say(prompt),
		on: { ENDSPEECH: 'ask' }
            },
            ask: {
		entry: [send('LISTEN'), send('MAX', {delay: 5000, id: 'noMax'})]
            },
            nomatch: {
                entry: say("Sorry I didn't catch that"),
                on: { ENDSPEECH: "prompt" }
            }
	}})
}

const grammar: { [index: string]: { person?: string, day?: string, time?: string } } = {
    "John": { person: "John Appleseed" },
    "Peter": { person: "Peter Pan" },
    "Emma": { person: "Emma Watson" },
    "Greta": { person: "Greta Thunberg" },
    "on Monday": { day: "Monday" },
    "on Tuesday": { day: "Tuesday" },
    "on Wednesday": { day: "Wednesday" },
    "on Thursday": { day: "Thursday" },
    "on Friday": { day: "Friday" },
    "on Saturday": { day: "Saturday" },
    "on Sunday": { day: "Sunday" },
    "at 10": { time: "10:00" },
    "at 8": { time: "8:00" },
    "at 7": { time: "7:00" },
    "at 4": { time: "4:00" },
    "at 5": { time: "5:00" },
    "at five": { time: "5:00" }
}

const polar_grammar: { [index: string]: { yes_no?: boolean } } = {
    "yes": { yes_no: true },
    "yep": { yes_no: true },
    "indeed": { yes_no: true },
    "of course": { yes_no: true },
    "yes please": { yes_no: true },
    "no": { yes_no: false },
    "nope": { yes_no: false },
    "no way": { yes_no: false },
    "absolutely not": { yes_no: false },
    "not at all": { yes_no: false },
}

let contador = 0; //counter

export const dmImproved: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "askAppointment" },
            states: {
                prompt: { entry: say("Let's create an appointment") }
            }
        },
        askAppointment: {
            initial: 'who',
            on: {
                RECOGNISED: {
                    actions: assign((context) => { return { counter: 0 }}) //not used but I needed sth in here I think
                },
            },
            states: {
                hist: { type: "history", history: "deep" },
        who: {
            on: {
                RECOGNISED: [
                    { cond: (context) => context.recResult === "help", target: "#root.dm.appointment.helper_who" },
                    { cond: (context) => "person" in (grammar[context.recResult] || {}),
                    actions: [assign((context) => { return { person: grammar[context.recResult].person } }), cancel('noMax')],
                    target: "day"
                },
                { target: ".nomatch",
                    actions: cancel('noMax') }],
            MAX:  
                [{cond: () => (contador++) <= 2, target: '#root.dm.appointment.max'},
                {target: '#root.dm.appointment.maxFinal'}]
            },
            ...promptAndAskAndNomatch("Who are you meeting with?"),
        },
        day: {
            on: {
                RECOGNISED: [
                    { cond: (context) => context.recResult === "help", target: "#root.dm.appointment.helper_day" },
                    { cond: (context) => "day" in (grammar[context.recResult] || {}),
                    actions: [assign((context) => { return { day: grammar[context.recResult].day } }), cancel('noMax')],
                    target: "whole_day"
                },
                { target: ".nomatch",
                    actions: cancel('noMax') }],
            MAX:  
                [{cond: () => (contador++) <= 2, target: '#root.dm.appointment.max'},
                {target: '#root.dm.appointment.maxFinal'}]
            },
            ...promptAndAskAndNomatch(`OK. On which day is your meeting?`),
        },
        whole_day: {
            on: {
                RECOGNISED: [
                    { cond: (context) => context.recResult === "help", target: "#root.dm.appointment.helper_whole_day" },
                    { cond: (context) => polar_grammar[context.recResult] ? polar_grammar[context.recResult].yes_no === true : false,
                        actions: [cancel('noMax')],
                        target: "confirmation_whole_day"},
                    { cond: (context) => polar_grammar[context.recResult] ? polar_grammar[context.recResult].yes_no === false : false,
                        actions: [cancel('noMax')],
                        target: "time"},
                { target: ".nomatch",
                    actions: cancel('noMax') }],
            MAX:  
                [{cond: () => (contador++) <= 2, target: '#root.dm.appointment.max'},
                {target: '#root.dm.appointment.maxFinal'}]
            },
            ...promptAndAskAndNomatch(`OK. Will your meeting take the whole day?`),
        },
        time: {
            on: {
                RECOGNISED: [
                    { cond: (context) => context.recResult === "help", target: "#root.dm.appointment.helper_time" },
                    { cond: (context) => "time" in (grammar[context.recResult] || {}),
                    actions: [assign((context) => { return { time: grammar[context.recResult].time } }), cancel('noMax')],
                    target: "confirmation_with_time"
                },
                { target: ".nomatch",
                    actions: cancel('noMax') }],
            MAX:  
                [{cond: () => (contador++) <= 2, target: '#root.dm.appointment.max'},
                {target: '#root.dm.appointment.maxFinal'}]
            },
            ...promptAndAskAndNomatch(`OK. At what time is your meeting?`),
        },
        confirmation_whole_day: {
            on: {
                RECOGNISED: [
                    { cond: (context) => context.recResult === "help", target: "#root.dm.appointment.helper_confs" },
                    { cond: (context) => polar_grammar[context.recResult] ? polar_grammar[context.recResult].yes_no === true : false,
                        actions: [cancel('noMax')],
                        target: "appointment_created"},
                    { cond: (context) => polar_grammar[context.recResult] ? polar_grammar[context.recResult].yes_no === false : false,
                        actions: [cancel('noMax')],
                        target: "who"},
                { target: ".nomatch",
                    actions: cancel('noMax') }],
            MAX:  
                [{cond: () => (contador++) <= 2, target: '#root.dm.appointment.max'},
                {target: '#root.dm.appointment.maxFinal'}]
            },
            ...promptAndAskAndNomatch(`OK. Do you want me to create an appointment for the whole day?`),
        },
        confirmation_with_time: {
            on: {
                RECOGNISED: [
                    { cond: (context) => context.recResult === "help", target: "#root.dm.appointment.helper_confs" },
                    { cond: (context) => polar_grammar[context.recResult] ? polar_grammar[context.recResult].yes_no === true : false,
                        actions: [cancel('noMax')],
                        target: "appointment_created"},
                    { cond: (context) => polar_grammar[context.recResult] ? polar_grammar[context.recResult].yes_no === false : false,
                        actions: [cancel('noMax')],
                        target: "who"},
                { target: ".nomatch",
                    actions: cancel('noMax') }],
            MAX:  
                [{cond: () => (contador++) <= 2, target: '#root.dm.appointment.max'},
                {target: '#root.dm.appointment.maxFinal'}]
            },
            ...promptAndAskAndNomatch(`OK. Do you want me to create this appointment?`),
        },
        appointment_created: {
            initial: "prompt",
            states: {
                prompt: { entry: say("Your appointment has been created!") }
            }
        },
}},
max: {
    entry: say("Sorry, I didn't hear anything"),
    on: { "ENDSPEECH": 
        {target: '#root.dm.appointment.askAppointment.hist'}
}},
maxFinal: {
    entry: say("Alright, since you don't wanna talk to me I'm gonna go to sleep"),
    always: '#root.dm.init'
}, 
// different reprompts for help
helper_who: {
    entry: say("I need to know what person you'll be meeting. For example, you could say Peter... so who are you meeting with?"),
    on: { "ENDSPEECH": '#root.dm.appointment.askAppointment.hist'}
},
helper_day: {
    entry: say("I'm looking for a day of the week here. For example, you could say on Wednesday... so on which day is your meeting?"),
    on: { "ENDSPEECH": '#root.dm.appointment.askAppointment.hist'}
},
helper_whole_day: {
    entry: say("I'm asking if you will spend an entire day at the meeting. Your answer could be yes or no... so will it take the whole day?"),
    on: { "ENDSPEECH": '#root.dm.appointment.askAppointment.hist'}
},
helper_time: {
    entry: say("I'm looking for a time to set your meeting. For example, you could say at ten... so at what time is your meeting?"),
    on: { "ENDSPEECH": '#root.dm.appointment.askAppointment.hist'}
},
helper_confs: {
    entry: say("I'm making sure if I got the information correct. If I got it right, you can say yes... so do you want me to create the appointment?"),
    on: { "ENDSPEECH": '#root.dm.appointment.askAppointment.hist'}
},
}})
