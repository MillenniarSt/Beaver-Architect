import { Builder, BuilderRegistry } from "../../register/builder";
import { GeoRegistry } from "../../register/geo";
import { mapFromJson } from "../../util";
import { getProject } from "../project";
import { Engineer, ResourceReference } from "./engineer";
import { StyleRule } from "./style";

export class Component extends Engineer {

    static readonly LOADING: Component = new Component(ResourceReference.LOADING, new GeoRegistry('any', []), new Builder(new BuilderRegistry('empty')), new Map())

    constructor(
        ref: ResourceReference,
        public baseGeo: GeoRegistry,
        public builder: Builder,
        public rules: Map<string, StyleRule>
    ) {
        super(ref)
    }

    static fromJson(ref: ResourceReference, json: any): Component {
        return new Component(ref, getProject().GEOS.get(json.baseGeo), Builder.fromJson(json.builder), mapFromJson(json.rules, StyleRule.fromJson))
    }
}