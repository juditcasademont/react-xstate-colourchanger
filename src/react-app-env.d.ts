/// <reference types="react-scripts" />

declare module 'react-speech-kit';

interface SDSContext {
    recResult: string;
    nluData: any;
    ttsAgenda: string;
    person: string,
    day: string,
    time: string,
    yes_no: boolean,
    rasa_guess: string,
    utterance: string,
    command: string,
    action: string,
    object: string,
    counter: number,
}

type SDSEvent =
    | { type: 'CLICK' }
    | { type: 'RECOGNISED' }
    | { type: 'MAX' }
    | { type: 'ASRRESULT', value: string }
    | { type: 'ENDSPEECH' }
    | { type: 'LISTEN' }
    | { type: 'SPEAK', value: string };
