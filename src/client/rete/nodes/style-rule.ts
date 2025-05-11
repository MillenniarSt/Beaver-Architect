import { ClassicPreset } from "rete";
import { idToLabel } from "../../util";
import { ReteConnection, ReteNode, ReteSocket } from "../preset";
import { RandomTypeRegistry } from "../../register/random";

export class StyleRuleNode extends ReteNode<
    {},
    { rule: StyleRuleSocket },
    {}
> {

    constructor(
        readonly ruleId: string,
        readonly type: RandomTypeRegistry
    ) {
        super(idToLabel(ruleId))
        this.addOutput('rule', new ClassicPreset.Output(new StyleRuleSocket(type), 'Rule', false))
    }
}

export class StyleRuleSocket extends ReteSocket {

    constructor(
        readonly type?: RandomTypeRegistry
    ) {
        super('Rule')
    }

    isCompatibleWith(socket: ReteSocket) {
        return socket instanceof StyleRuleSocket && (socket.type === undefined || this.type === socket.type)
    }
}

export class StyleRuleConnection extends ReteConnection<StyleRuleNode, ReteNode<{ rules: StyleRuleSocket }>> {

    constructor(parent: StyleRuleNode, child: ReteNode) {
        super(parent, 'rule', child, 'rules')
    }
}