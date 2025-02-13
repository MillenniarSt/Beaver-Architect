import { NodeEditor } from "rete"
import { connectionPreset, renderPreset, Schemes } from "./preset"
import { AreaExtensions, AreaPlugin } from "rete-area-plugin"
import { ConnectionPlugin } from "rete-connection-plugin"
import { AngularArea2D, AngularPlugin } from "rete-angular-plugin/19"
import { Injector } from "@angular/core"
import { getConnectionSockets } from "./utils"
import { StructureEngineerNode } from "./nodes/engineer"
import { BuilderNode } from "./nodes/builder"
import { getObject3 } from "../types"

export class StructureEngineerEditor {

    readonly editor: NodeEditor<Schemes>
    readonly area: AreaPlugin<Schemes, AngularArea2D<Schemes>>
    readonly connection: ConnectionPlugin<Schemes, AngularArea2D<Schemes>>
    readonly render: AngularPlugin<Schemes, AngularArea2D<Schemes>>

    readonly engineerNode!: StructureEngineerNode

    constructor(
        protected readonly container: HTMLElement,
        protected readonly injector: Injector
    ) {
        this.editor = new NodeEditor<Schemes>()
        this.area = new AreaPlugin<Schemes, AngularArea2D<Schemes>>(this.container)
        this.connection = new ConnectionPlugin<Schemes, AngularArea2D<Schemes>>()
        this.render = new AngularPlugin<Schemes, AngularArea2D<Schemes>>({ injector })

        AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
            accumulating: AreaExtensions.accumulateOnCtrl(),
        })

        this.render.addPreset(renderPreset())
        this.connection.addPreset(connectionPreset(this.editor, this.connection))

        this.editor.use(this.area)
        this.area.use(this.connection)
        this.area.use(this.render)

        AreaExtensions.simpleNodesOrder(this.area)
        AreaExtensions.showInputControl(this.area)

        this.editor.addPipe((context) => {
            if (context.type === "connectioncreate") {
                const { data } = context
                const { source, target } = getConnectionSockets(this.editor, data)

                if (!source!.isCompatibleWith(target!)) {
                    console.log("Sockets are not compatible")
                    return
                }
            }
            return context
        })

        this.engineerNode = new StructureEngineerNode(getObject3('prism'))
    }

    async setup() {
        await this.editor.addNode(this.engineerNode)

        AreaExtensions.zoomAt(this.area, this.editor.getNodes())
    }

    async addBuilder(builder: BuilderNode) {
        await this.editor.addNode(builder)
    }
}