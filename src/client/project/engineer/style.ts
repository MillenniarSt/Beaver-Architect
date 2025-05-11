import { RandomRegistry, RandomTypeRegistry } from "../../register/random";
import { mapFromJson } from "../../util";
import { getProject } from "../project";
import { Engineer, ListUpdateObject, ResourceReference } from "./engineer";

export type StyleUpdate = {
    isAbstract?: boolean
    implementations?: ListUpdateObject[]
    rules?: ListUpdateObject<{
        type?: string,
        random?: { type: string, data: any } | null,
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
        readonly type: RandomTypeRegistry,
        readonly random: RandomRegistry | null,
        readonly data: any,
        readonly fixed: boolean = false,
        readonly fromImplementations: ResourceReference[] = []
    ) { }

    static fromJson(json: any): StyleRule {
        console.log(json)
        const type = getProject().RANDOM_TYPES.get(json.type)
        return json.random ? 
            new StyleRule(type, type.getRandom(json.random.type), json.random.data, json.fixed, json.fromImplementations.map((ref: string) => new ResourceReference(ref))) : 
            new StyleRule(type, null, undefined, json.fixed, json.fromImplementations.map((ref: string) => new ResourceReference(ref)))
    }

    get isDependency(): boolean {
        return this.fromImplementations.length > 0
    }

    get isAbstract(): boolean {
        return this.random === null
    }
}