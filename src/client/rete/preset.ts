import { ClassicFlow, ConnectionPlugin, getSourceTarget, Preset } from "rete-connection-plugin";
import { AngularArea2D, RenderPreset, Presets as RetePreset } from "rete-angular-plugin/19";
import { ClassicPreset, GetSchemes, NodeEditor } from "rete";
import { getConnectionSockets } from "./utils";

export abstract class ReteSocket extends ClassicPreset.Socket {

    abstract isCompatibleWith(socket: ClassicPreset.Socket): boolean
}

export class ReteControl extends ClassicPreset.Control {

}

export class ReteNode<
    Inputs extends Record<string, ReteSocket> = Record<string, ReteSocket>, 
    Outputs extends Record<string, ReteSocket> = Record<string, ReteSocket>, 
    Controls extends Record<string, ReteControl> = Record<string, ReteControl>
> extends ClassicPreset.Node<Inputs, Outputs, Controls> {


}

export class ReteConnection<Source extends ReteNode = ReteNode, Target extends ReteNode = ReteNode> extends ClassicPreset.Connection<Source, Target> {

}

export function connectionPreset(editor: NodeEditor<Schemes>, connection: ConnectionPlugin<Schemes, AngularArea2D<Schemes>>): Preset<Schemes> {
    return () => new ClassicFlow({
        canMakeConnection(from, to) {
            const [source, target] = getSourceTarget(from, to) || [null, null]

            if (!source || !target || from === to) return false

            const sockets = getConnectionSockets(
                editor,
                new ClassicPreset.Connection(
                    editor.getNode(source.nodeId)!,
                    source.key as never,
                    editor.getNode(target.nodeId)!,
                    target.key as never
                )
            )

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
                    new ClassicPreset.Connection(
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
    return RetePreset.classic.setup({
        /*
        customize: {
            node(context) {
                if(context.payload instanceof BuilderNode) {
                    return BuilderComponent
                } else if(context.payload instanceof StructureEngineerNode) {
                    return BuilderComponent
                }
                console.error('Invalid Node type')
                return null
            }
        }
        */
    })
}

export type Schemes = GetSchemes<ReteNode, ReteConnection>