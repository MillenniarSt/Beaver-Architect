import { ClassicPreset } from "rete";
import { BuilderNode } from "./nodes/builder";
import { StructureEngineerNode } from "./nodes/engineer";
import { BuilderOptionsNode } from "./nodes/options";

export class EngineerBuilderConnection extends ClassicPreset.Connection<StructureEngineerNode, BuilderNode> {
  
  constructor(engineer: StructureEngineerNode, builder: BuilderNode) {
    super(engineer, 'builder', builder, 'parent')
  }
}

export class BuilderConnection extends ClassicPreset.Connection<BuilderNode, BuilderNode> {
  
  constructor(parent: BuilderNode, port: string, child: BuilderNode) {
    super(parent, port, child, 'parent')
  }
}

export class BuilderOptionsConnection extends ClassicPreset.Connection<BuilderNode, BuilderOptionsNode> {

  constructor(builder: BuilderNode, port: string, option: BuilderOptionsNode) {
    super(builder, port, option, port)
  }
}