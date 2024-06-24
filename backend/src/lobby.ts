
class Lobby {
    id: string;
    users: string[] = [];
    constructor() {
        this.id = Math.random().toString(10).substring(2, 8);
        this.users = [];
    }
}

export { Lobby };