import { mapFromJson } from "../../util";
import { Engineer, ListUpdateObject, ResourceReference } from "./engineer";
import { Random, RANDOM_TYPES, RandomType } from "../random";

export type StyleUpdate = {
    isAbstract?: boolean
    implementations?: ListUpdateObject[]
    rules?: ListUpdateObject<{
        type?: string,
        random?: { name: string, typeId: string, data: any } | null,
        fixed?: boolean,
        fromImplementations: string[]
    }>[]
}

export class Style extends Engineer {

    static readonly LOADING: Style = new Style(ResourceReference.LOADING, false, [], new Map())
    
    constructor(
        ref: ResourceReference,
        public isAbstract: boolean,
        public implementations: ResourceReference[],
        public rules: Map<string, StyleRule>
    ) {
        super(ref)
    }

    static fromJson(ref: ResourceReference, json: any): Style {
        return new Style(ref, json.isAbstract, json.implementations.map((impl: string) => new ResourceReference(impl)), mapFromJson(json.rules, StyleRule.fromJson))
    }
}

export class StyleRule {

    constructor(
        readonly type: string,
        readonly randomName: string | null,
        readonly data: any,
        readonly fixed: boolean = false,
        readonly fromImplementations: ResourceReference[] = []
    ) { }

    static fromJson(json: any): StyleRule {
        return json.random ? 
            new StyleRule(json.type, json.random.typeId, json.random.data, json.fixed, json.fromImplementations.map((ref: string) => new ResourceReference(ref))) : 
            new StyleRule(json.type, null, undefined, json.fixed, json.fromImplementations.map((ref: string) => new ResourceReference(ref)))
    }

    get isDependency(): boolean {
        return this.fromImplementations.length > 0
    }

    get isAbstract(): boolean {
        return this.randomName === null
    }

    get randomType(): RandomType {
        return RANDOM_TYPES[this.type]
    }

    get random(): Random {
        return this.randomType.get(this.randomName!)
    }
}