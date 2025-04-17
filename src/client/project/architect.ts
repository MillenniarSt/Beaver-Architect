import { LocalServer } from "../connection/server";
import { ArchitectInstance } from "../instance/architect";
import { Version } from "../instance/version";

export class Architect {

    constructor(
        readonly identifier: string,
        readonly version: Version,
        readonly name: string,

        readonly server: LocalServer
    ) { }

    static fromInstance(instance: ArchitectInstance, server: LocalServer): Architect {
        return new Architect(
            instance.identifier, instance.version, instance.name,
            server
        )
    }
}