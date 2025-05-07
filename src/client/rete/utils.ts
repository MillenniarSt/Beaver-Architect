import { ClassicPreset, NodeEditor } from "rete";
import { ReteConnection, ReteSocket, Schemes } from "./preset";

type Input = ClassicPreset.Input<ReteSocket>
type Output = ClassicPreset.Output<ReteSocket>

export function getConnectionSockets(
  editor: NodeEditor<Schemes>,
  connection: ReteConnection
) {
  const source = editor.getNode(connection.source)
  const target = editor.getNode(connection.target)

  const output =
    source &&
    (source.outputs as Record<string, Input>)[connection.sourceOutput]
  const input =
    target && (target.inputs as Record<string, Output>)[connection.targetInput]

  return {
    source: output?.socket,
    target: input?.socket
  }
}