import { NodeEditor } from "rete"
import { connectionPreset, renderPreset, Schemes } from "./preset"
import { AreaExtensions, AreaPlugin } from "rete-area-plugin"
import { ConnectionPlugin } from "rete-connection-plugin"
import { AngularArea2D, AngularPlugin } from "rete-angular-plugin/19"
import { Injector } from "@angular/core"
import { getConnectionSockets } from "./utils"
import { StructureEngineerNode } from "./nodes/engineer"
import { BuilderNode } from "./nodes/builder"
import { getBuilderType, getObject3 } from "../types"
import { BuilderConnection, BuilderOptionsConnection, EngineerBuilderConnection } from "./connection"
import { BuilderOptionsNode } from "./nodes/options"

export class StructureEngineerEditor {

    readonly editor: NodeEditor<Schemes>
    readonly area: AreaPlugin<Schemes, AngularArea2D<Schemes>>
    readonly connection: ConnectionPlugin<Schemes, AngularArea2D<Schemes>>
    readonly render: AngularPlugin<Schemes, AngularArea2D<Schemes>>

    readonly engineerNode: StructureEngineerNode

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

        this.engineerNode = new StructureEngineerNode()
    }

    async setup(json: any) {
        this.engineerNode.baseType = getObject3(json.objectType)
        await this.editor.addNode(this.engineerNode)

        // Nodes
        for(let i = 0; i < json.nodes.builders.length; i++) {
            const builder = json.nodes.builders[i]
            const node = new BuilderNode(getBuilderType(builder.type))
            await this.editor.addNode(node)
            await this.area.translate(node.id, { x: builder.x, y: builder.y })
        }
        for(let i = 0; i < json.nodes.options.length; i++) {
            const options = json.nodes.options[i]
            const node = new BuilderOptionsNode(options.options)
            await this.editor.addNode(node)
            await this.area.translate(node.id, { x: options.x, y: options.y })
        }

        // Connections
        if(json.baseBuilder) {
            await this.editor.addConnection(new EngineerBuilderConnection(this.engineerNode, this.getBuilderNode(json.baseBuilder)))
        }
        for(let i = 0; i < json.connections.builders.length; i++) {
            const connection = json.connections.builders[i]
            await this.editor.addConnection(new BuilderConnection(this.getBuilderNode(connection.a), connection.port, this.getBuilderNode(connection.b)))
        }
        for(let i = 0; i < json.connections.options.length; i++) {
            const connection = json.connections.options[i]
            await this.editor.addConnection(new BuilderOptionsConnection(this.getBuilderNode(connection.a), connection.port, this.getOptionsNode(connection.b)))
        }

        AreaExtensions.zoomAt(this.area, this.editor.getNodes())
    }

    async addBuilder(builder: BuilderNode) {
        await this.editor.addNode(builder)
    }

    getBuilderNode(id: string): BuilderNode {
        return this.editor.getNode(id) as BuilderNode
    }

    getOptionsNode(id: string): BuilderOptionsNode {
        return this.editor.getNode(id) as BuilderOptionsNode
    }
}