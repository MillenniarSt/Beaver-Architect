import { LANG } from "../instance/instance";
import { Registry } from "./register";

export class Random extends Registry {

    constructor(
        readonly id: string
    ) {
        super()
    }

    get label(): string {
        return LANG.get(`random.${this.id}`, 'Unnamed Random')
    }

    static fromJson(json: any): Random {
        return new Random(json.id)
    }
}