import { mapFromJson } from "../../util";
import { Engineer, ListUpdateObject, ResourceReference } from "./engineer";

export type StyleUpdate = {
    isAbstract?: boolean
    implementations?: ListUpdateObject[]
    rules?: ListUpdateObject<{
        type: string,
        random: any,
        constant: boolean
    }>[]
}

export class Style extends Engineer {

    static readonly LOADING: Style = new Style(new ResourceReference({ pack: 'undefined', location: 'loading' }), false, [], new Map())
    
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
        readonly constant: boolean = false
    ) { }

    static fromJson(json: any): StyleRule {
        return new StyleRule(json.type, json.constant)
    }
}