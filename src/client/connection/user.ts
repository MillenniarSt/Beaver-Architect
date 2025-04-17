export type PublicUserData = {
    name: string
    image?: string
    banner?: string
    bio: string
}

export class User {

    constructor(
        readonly id: string,
        readonly publicData: PublicUserData
    ) { }

    static fromJson(json: any): User {
        return new User(json.id, json.publicData)
    }

    toJson() {
        return {
            id: this.id,
            publicData: this.publicData
        }
    }
}