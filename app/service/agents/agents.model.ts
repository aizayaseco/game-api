export class Agent {
    private id: String = '';
    private firstName: String = '';
    private lastName: String = '';
    private dpURL: String = '';

    constructor(id: String,
                firstName: String,
                lastName: String,
                dpURL: String) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dpURL = dpURL;
    }

}
