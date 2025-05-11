import { Type } from "@angular/core";
import { ICONS, LANG } from "../instance/instance";
import { Registry } from "./register";
import { ConstantBooleanComponent, RandomBooleanComponent, RandomBooleanResultComponent } from "../../app/components/random/boolean/boolean.component";
import { getProject } from "../project/project";
import { ConstantEnumComponent, RandomEnumComponent, RandomEnumResultComponent } from "../../app/components/random/enum/enum.component";
import { KeyNotRegistered } from "../errors";
import { Icon } from "../instance/resources";

export class Seed {

	public current: number

	constructor(seed: number = Math.floor(Math.random() * 2147483647)) {
		this.current = seed % 2147483647
		if (this.current <= 0) {
			this.current += 2147483646
		}
	}

	next(): number {
		this.current = (this.current * 16807) % 2147483647
		return (this.current - 1) / 2147483646
	}
}

export type RandomClientData = { isConstant: boolean, editor: Type<any>, result: Type<any> }

const UNDEFINED_RANDOM_CLINT_DATA: RandomClientData = { isConstant: false, editor: ConstantBooleanComponent, result: RandomBooleanResultComponent }

const RANDOM_CLIENT_DATA: Record<string, RandomClientData> = {
    'c_boolean': { isConstant: true, editor: ConstantBooleanComponent, result: RandomBooleanResultComponent },
    'boolean': { isConstant: false, editor: RandomBooleanComponent, result: RandomBooleanResultComponent },
    'c_enum': { isConstant: true, editor: ConstantEnumComponent, result: RandomEnumResultComponent },
    'enum': { isConstant: false, editor: RandomEnumComponent, result: RandomEnumResultComponent }
}

export class RandomRegistry<T extends {} = {}> extends Registry {

    constructor(
        readonly id: string,
        readonly isConstant: boolean,
        readonly editor: Type<any>,
        readonly result: Type<any>
    ) {
        super()
    }

    static fromJson(json: any): RandomRegistry {
        let clientData = RANDOM_CLIENT_DATA[json.clientDataOf ?? json.id] ?? UNDEFINED_RANDOM_CLINT_DATA
        return new RandomRegistry(json.id, clientData.isConstant, clientData.editor, clientData.result)
    }

    get label(): string {
        return LANG.get(`random.${this.id}`, 'Unnamed Random')
    }
}

export class RandomTypeRegistry<T extends {} = {}> extends Registry {

    constructor(
        readonly id: string,
        readonly constantId: string,
        readonly randoms: Record<string, RandomRegistry<T>>,
        readonly allowed?: T[]
    ) {
        super()
    }

    static fromJson(json: any): RandomTypeRegistry {
        return new RandomTypeRegistry(json.id, json.constantId, Object.fromEntries(json.randoms.map((random: string) => [random, getProject().RANDOMS.get(random)])), json.allowed)
    }

    getRandom(key: string): RandomRegistry<T> {
        const random = this.randoms[key]
        if (!random)
            throw new KeyNotRegistered(key, 'RandomType', 'randoms')

        return random
    }

    get constant(): RandomRegistry<T> {
        return this.randoms[this.constantId]
    }

    get randomList(): RandomRegistry<T>[] {
        return Object.values(this.randoms)
    }

    get label(): string {
        return LANG.get(`random_type.${this.id}`, 'Unnamed Random Type')
    }

    get icon(): Icon {
        return ICONS.get(`random_type.${this.id}`)
    }
}