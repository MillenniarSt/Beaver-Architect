import { Injector } from "@angular/core";
import { ReteEditor } from "../../../../../client/rete/editor";
import { BuilderNode, BuilderSocket } from "../../../../../client/rete/nodes/builder";
import { BuilderOptionsNode } from "../../../../../client/rete/nodes/options";
import { Component } from "../../../../../client/project/engineer/component";
import { StyleRuleSocket } from "../../../../../client/rete/nodes/style-rule";
import { ReteNode } from "../../../../../client/rete/preset";
import { ClassicPreset } from "rete";
import { GeoRegistry } from "../../../../../client/register/geo";

export class ComponentEditor extends ReteEditor {

    readonly engineerNode: ComponentEngineerNode

    constructor(
        readonly component: Component,
        container: HTMLElement,
        injector: Injector
    ) {
        super(container, injector)
        this.engineerNode = new ComponentEngineerNode(component.baseGeo)
    }

    override async build(): Promise<void> {
        await this.editor.addNode(this.engineerNode)
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

export class ComponentEngineerNode extends ReteNode<
    { rules: StyleRuleSocket },
    { builder: BuilderSocket },
    {}
> {

    constructor(
        public baseType: GeoRegistry
    ) {
        super('Component')
        this.addInput('rules', new ClassicPreset.Input(new StyleRuleSocket(), 'Parameters', true))
        this.addOutput('builder', new ClassicPreset.Output(new BuilderSocket(baseType), 'Builder', false))
    }
}