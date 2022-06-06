export class Word {
    private id: Number = 0;
    private word: String = '';

    constructor(id: Number, word: String) {
        this.id = id;
        this.word = word;
    }

}

export class GuessedWord {
    private key: Number = 0;
    private date: String = '';

    constructor(key: Number, date: String) {
        this.key = key;
        this.date = date;
    }

}
