interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onaudioend: null | ((this: SpeechRecognition, ev: Event) => void);
  onaudiostart: null | ((this: SpeechRecognition, ev: Event) => void);
  onend: null | ((this: SpeechRecognition, ev: Event) => void);
  onerror: null | ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void);
  onnomatch: null | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void);
  onresult: null | ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void);
  onsoundend: null | ((this: SpeechRecognition, ev: Event) => void);
  onsoundstart: null | ((this: SpeechRecognition, ev: Event) => void);
  onspeechend: null | ((this: SpeechRecognition, ev: Event) => void);
  onspeechstart: null | ((this: SpeechRecognition, ev: Event) => void);
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare const webkitSpeechRecognition: SpeechRecognitionStatic;

interface Window {
  SpeechRecognition?: SpeechRecognitionStatic;
  webkitSpeechRecognition?: SpeechRecognitionStatic;
}
