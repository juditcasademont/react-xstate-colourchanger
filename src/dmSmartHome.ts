import { MachineConfig, send, Action, assign } from "xstate"; 

export function say(text: string): Action<SDSContext, SDSEvent> {
    return send((_context: SDSContext) => ({ type: "SPEAK", value: text }))
}

export function listen(): Action<SDSContext, SDSEvent> {
    return send('LISTEN')
}

import { loadGrammar } from './runparser'
import { parse } from './chartparser'
import { grammar } from './grammars/commandGrammar'

export const useGrammar = (input: any) => {
    const gram = loadGrammar(grammar)
    const prs = parse(input.split(/\s+/), gram)
    const result = prs.resultsForRule(gram.$root)[0]
    return [result.command.action, result.command.object]
}


export const dmHome: MachineConfig<SDSContext, any, SDSEvent> = ({
    initial: 'init',
    states: {
        init: {
            on: {
                CLICK: 'welcome'
            }
        },
        welcome: {
            initial: "prompt",
            on: {
                RECOGNISED: [{
                    // cond: (context) => "command" in (useGrammar(context.recResult) || {}),
                    actions: [assign((context) => { return { action: useGrammar(context.recResult)[0] } }), assign((context) => { return { object: useGrammar(context.recResult)[1] }})],
                    target: "response"

                },
                { target: ".nomatch" }]
            },
            states: {
                prompt: {
                    entry: say("Hi, what can I do for you?"),
                    on: { ENDSPEECH: "ask" }
                },
                ask: {
                    entry: listen()
                },
                nomatch: {
                    entry: say("I'm afraid I can't do that for you"),
                    on: { ENDSPEECH: "prompt" }
                }
            }
        },
        response: {
            entry: send('RECOGNISED'),
            on: {
                RECOGNISED: [
                    { target: 'option1', cond: (context) => useGrammar(context.recResult)[1] === "light" },
                    { target: 'option1', cond: (context) => useGrammar(context.recResult)[1] === "heat" },
                    { target: 'option1', cond: (context) => useGrammar(context.recResult)[1] === "air conditioning" },
                    { target: 'option2', cond: (context) => useGrammar(context.recResult)[1] === "door" },
                    { target: 'option2', cond: (context) => useGrammar(context.recResult)[1] === "window" },
                ]
            },
        },
        option1: {
            initial: "prompt",
            states: {
            prompt: {
                entry: send((context) => ({
                    type: "SPEAK",
                    value: `OK. I'll turn the ${context.object} ${context.action} for you`
                })),
        }}},
        option2: {
             initial: "prompt",
             states: {
             prompt: {
                 entry: send((context) => ({
                     type: "SPEAK",
                     value: `OK. I'll ${context.action} the ${context.object} for you`
                    }))}}}}})


