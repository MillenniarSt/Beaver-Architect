import { ICONS, LANG } from "../instance/instance";
import { Icon } from "../instance/resources";
import { getProject } from "../project/project";
import { Registry } from "./register";

export class BuilderRegistry extends Registry {

    constructor(
        readonly id: string
    ) {
        super()
    }

    static fromJson(json: any): BuilderRegistry {
        return new BuilderRegistry(json.id)
    }

    get label(): string {
        return LANG.get(`builder.${this.id}`, 'Unnamed Builder')
    }

    get icon(): Icon {
        return ICONS.get(`builder.${this.id}`)
    }
}

export class Builder {

    constructor(
        readonly type: BuilderRegistry
    ) { }

    static fromJson(json: any): Builder {
        return new Builder(getProject().BUILDERS.get(json.type))
    }
}