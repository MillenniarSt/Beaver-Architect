import { ClassicPreset } from "rete";
import { RandomType } from "../../project/random";
import { idToLabel } from "../../util";
import { ReteConnection, ReteNode, ReteSocket } from "../preset";

export class StyleRuleNode extends ReteNode<
    {},
    { rule: StyleRuleSocket },
    {}
> {

    constructor(
        readonly ruleId: string,
        readonly type: string
    ) {
        super(idToLabel(ruleId))
        this.addOutput('rule', new ClassicPreset.Output(new StyleRuleSocket(type), 'Rule', false))
    }

    get randomType(): RandomType {
        return RandomType.get(this.type)
    }
}

export class StyleRuleSocket extends ReteSocket {

    constructor(
        readonly type?: string
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