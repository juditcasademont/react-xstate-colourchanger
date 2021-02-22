import { MachineConfig, send, Action, assign } from "xstate";


export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
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

export const dmMachine: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'welcome',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            initial: "prompt",
            on: { ENDSPEECH: "who" },
            states: {
                prompt: { entry: say("Let's create an appointment") }
            }
        },
        who: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "person" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { person: grammar[context.recResult].person } }),
                    target: "day"

                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("Who are you meeting with?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't know them"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        day: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "day" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { day: grammar[context.recResult].day } }),
                    target: "whole_day"
                },
                    { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK. Meeting ${context.person}. On which day is your meeting?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't know what day this is"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        whole_day: {
            initial: "prompt",
            on: {
                RECOGNISED: [
                    { target: 'confirmation_whole_day', cond: (context) => polar_grammar[context.recResult].yes_no === true },
                    { target: 'time', cond: (context) => polar_grammar[context.recResult].yes_no === false },
                
                    { target: ".nomatch" }],
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK. Meeting ${context.person} on ${context.day}. Will it take the whole day?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I don't understand"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        time: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    cond: (context) => "time" in (grammar[context.recResult] || {}),
                    actions: assign((context) => { return { time: grammar[context.recResult].time } }),
                    target: "confirmation_with_time"
                },
                    { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `OK. At what time is your meeting?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry you will have to repeat that"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        confirmation_whole_day: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                     target: 'appointment_created', cond: (context) => polar_grammar[context.recResult].yes_no === true },
                     { target: 'who', cond: (context) => polar_grammar[context.recResult].yes_no === false },
                    { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Do you want me to create an appointment with ${context.person} on ${context.day} for the whole day?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I didn't catch that"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        confirmation_with_time: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                     target: 'appointment_created', cond: (context) => polar_grammar[context.recResult].yes_no === true },
                     { target: 'who', cond: (context) => polar_grammar[context.recResult].yes_no === false },
                    { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: send((context) => ({
                        type: "SPEAK",
                        value: `Do you want me to create an appointment with ${context.person} on ${context.day} at ${context.time}?`
                    })),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("Sorry I didn't catch that"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        appointment_created: {
            initial: "prompt",
            states: {
                prompt: { entry: say("Your appointment has been created!") }
            }
        },
}})
