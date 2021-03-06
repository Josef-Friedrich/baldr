interface Counter {
    sequence: QuestionSequence;
    question: number;
    answer: number;
}
interface Spec {
    question?: string;
    answer?: string;
    heading?: string;
    subQuestions?: Spec[];
}
interface RawSpecObject extends Spec {
    q?: string;
    a?: string;
    h?: string;
    s?: RawSpecObject[];
    questions?: RawSpecObject[];
}
declare type RawSpec = string | string[] | RawSpecObject | RawSpecObject[];
/**
 * `['q1', 'a1', 'q2', 'q3']`
 */
declare type QuestionSequence = string[];
/**
 * A questions with sub questions.
 */
export declare class Question {
    level: number;
    heading?: string;
    question?: string;
    questionNo?: number;
    answer?: string;
    answerNo?: number;
    subQuestions?: Question[];
    private readonly counter;
    constructor(spec: Spec, counter: Counter, level: number);
    get sequence(): QuestionSequence;
    get stepCount(): number;
    /**
     * heading + question without answer.
     */
    get questionText(): string;
    private static parseRecursively;
    private static initCounter;
    static parse(rawSpec: RawSpec): Question[];
}
export declare function generateTexMarkup(questions: Question[]): string;
export {};
