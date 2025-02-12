import { ClassicFlow, ConnectionPlugin, Presets as ConnectionPresets, getSourceTarget, Preset } from "rete-connection-plugin";
import { AngularArea2D, RenderPreset, Presets as RetePreset } from "rete-angular-plugin/19";
import { GetSchemes, NodeEditor } from "rete";
import { BuilderNode } from "./nodes/builder";
import { StructureEngineerNode } from "./nodes/engineer";
import { Connection } from "./connection";
import { BuilderSocket } from "./sockets";
import { getConnectionSockets } from "./utils";

export function connectionPreset(editor: NodeEditor<Schemes>, connection: ConnectionPlugin<Schemes, AngularArea2D<Schemes>>): Preset<Schemes> {
    return () => new ClassicFlow({
        canMakeConnection(from, to) {
            const [source, target] = getSourceTarget(from, to) || [null, null]

            if (!source || !target || from === to) return false

            const sockets = getConnectionSockets(
                editor,
                new Connection(
                    editor.getNode(source.nodeId)!,
                    source.key as never,
                    editor.getNode(target.nodeId)!,
                    target.key as never
                )
            )
            console.log(sockets)

            if (!sockets.source!.isCompatibleWith(sockets.target!)) {
                console.log("Sockets are not compatible")
                connection.drop()
                return false
            }

            return Boolean(source && target)
        },
        makeConnection(from, to, context) {
            const [source, target] = getSourceTarget(from, to) || [null, null];
            const { editor } = context;

            if (source && target) {
                editor.addConnection(
                    new Connection(
                        editor.getNode(source.nodeId)!,
                        source.key as never,
                        editor.getNode(target.nodeId)!,
                        target.key as never
                    )
                )
                return true
            }
            return
        },
    })
}

export function renderPreset(): RenderPreset<Schemes, AngularArea2D<Schemes>> {
    return RetePreset.classic.setup()
}

export type Sockets =
    | BuilderSocket

export type NodeProps =
    | StructureEngineerNode
    | BuilderNode

export type ConnProps =
    | Connection<StructureEngineerNode, BuilderNode>
    | Connection<BuilderNode, BuilderNode>

export type Schemes = GetSchemes<NodeProps, ConnProps>