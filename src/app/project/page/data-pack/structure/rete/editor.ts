import { NodeEditor } from "rete"
import { connectionPreset, renderPreset, Schemes } from "./preset"
import { AreaExtensions, AreaPlugin } from "rete-area-plugin"
import { ConnectionPlugin } from "rete-connection-plugin"
import { AngularArea2D, AngularPlugin } from "rete-angular-plugin/19"
import { Injector } from "@angular/core"
import { ControlFlowEngine, DataflowEngine } from "rete-engine"
import { getConnectionSockets } from "./utils"
import { StructureEngineerNode } from "./nodes/engineer"
import { BuilderNode } from "./nodes/builder"

export class StructureEngineerEditor {

    readonly editor: NodeEditor<Schemes>
    readonly area: AreaPlugin<Schemes, AngularArea2D<Schemes>>
    readonly connection: ConnectionPlugin<Schemes, AngularArea2D<Schemes>>
    readonly render: AngularPlugin<Schemes, AngularArea2D<Schemes>>
    readonly dataflow: DataflowEngine<Schemes>
    readonly engine: ControlFlowEngine<Schemes>

    readonly baseNode: StructureEngineerNode

    constructor(
        protected readonly container: HTMLElement,
        protected readonly injector: Injector
    ) {
        this.editor = new NodeEditor<Schemes>()
        this.area = new AreaPlugin<Schemes, AngularArea2D<Schemes>>(this.container)
        this.connection = new ConnectionPlugin<Schemes, AngularArea2D<Schemes>>()
        this.render = new AngularPlugin<Schemes, AngularArea2D<Schemes>>({ injector })
        this.dataflow = new DataflowEngine<Schemes>()
        this.engine = new ControlFlowEngine<Schemes>()

        AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
            accumulating: AreaExtensions.accumulateOnCtrl(),
        })

        this.render.addPreset(renderPreset())
        this.connection.addPreset(connectionPreset(this.editor, this.connection))

        this.editor.use(this.engine)
        this.editor.use(this.dataflow)
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

        this.baseNode = new StructureEngineerNode()
    }

    async setup() {
        await this.editor.addNode(this.baseNode)

        

        AreaExtensions.zoomAt(this.area, this.editor.getNodes())
    }
}