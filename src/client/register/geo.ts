import { ICONS, LANG } from "../instance/instance";
import { getProject } from "../project/project";
import { Registry } from "./register";

export class GeoRegistry extends Registry {

    constructor(
        readonly id: string,
        readonly children: GeoRegistry[]
    ) {
        super()
    }

    static fromJson(json: any): GeoRegistry {
        return new GeoRegistry(json.id, json.children.map((child: string) => getProject().GEOS.get(child)))
    }

    get label(): string {
        return LANG.get(`geo.${this.id}`, 'Unnamed Geo')
    }

    get icon(): string {
        return ICONS.get(`geo.${this.id}`)
    }

    isChild(type: GeoRegistry): boolean {
        if (this === type) {
            return true
        }

        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].isChild(type)) {
                return true
            }
        }

        return false
    }

    isParent(type: GeoRegistry): boolean {
        return type.isChild(this)
    }
}