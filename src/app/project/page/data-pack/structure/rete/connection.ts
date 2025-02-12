import { ClassicPreset } from "rete";
import { NodeProps } from "./preset";

export class Connection<
  A extends NodeProps,
  B extends NodeProps
> extends ClassicPreset.Connection<A, B> {
  isLoop?: boolean;
}