import { ClassicPreset, NodeEditor } from "rete";
import { ConnProps, Schemes, Sockets } from "./preset";

type Input = ClassicPreset.Input<Sockets>
type Output = ClassicPreset.Output<Sockets>

export function getConnectionSockets(
  editor: NodeEditor<Schemes>,
  connection: ConnProps
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
  };
}