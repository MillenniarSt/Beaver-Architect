import { Type } from "@angular/core";
import { ConstantBooleanComponent, RandomBooleanComponent, RandomBooleanResultComponent } from "../../app/components/random/boolean/boolean.component";
import { ConstantEnumComponent, RandomEnumComponent, RandomEnumResultComponent } from "../../app/components/random/enum/enum.component";
import { ListEmptyError } from "../errors";
import { idToLabel } from "../util";
import { absoluteResourcePath, resourcePath } from "../file";

export class Seed {

	public seed: number

	constructor(seed: number = Math.floor(Math.random() * 2147483647)) {
		this.seed = seed % 2147483647
		if (this.seed <= 0) {
			this.seed += 2147483646
		}
	}

	next(): number {
		this.seed = (this.seed * 16807) % 2147483647
		return (this.seed - 1) / 2147483646
	}
}

export type RandomEnumValue = { id: string, weight: number }

export class RandomType<V = any> {

	constructor(
		readonly label: string,
		readonly icon: string,
		readonly randoms: Record<string, Random<V>>
	) { }

	static get(name: string): RandomType {
		return RANDOM_TYPES[name]
	}

	get(name: string) {
		return this.randoms[name]
	}

	get constant(): ConstantRandom {
		return this.randoms['constant']
	}

	static simple<V>(constantTemplate: ConstantRandomTemplate, template: RandomTemplate<V>, label: string, icon: string, collection?: RandomCollectionItem<V>[]): RandomType<V> {
		return new RandomType(label, icon, {
			constant: ConstantRandom.fromTemplate(constantTemplate, 'Constant', collection),
			generic: ConcreteRandom.fromTemplate(template, 'Random', collection)
		})
	}
}

export type RandomCollectionItem<V = any> = { icon?: string, piIcon?: string, label: string, code: V }

export abstract class Random<V = any, D = any> {

	abstract get label(): string

	abstract get isConstant(): boolean

	abstract get editor(): Type<any>
	abstract get result(): Type<any>

	abstract evaluate(seed: Seed, data: D): V

	abstract get collection(): RandomCollectionItem<V>[] | undefined

	abstract get hasArchitectVariable(): boolean
}

export type ConstantRandomTemplate = { editor: Type<any>, result: Type<any> }

export class ConstantRandom<V = any> extends Random<V, V> {

	constructor(
		readonly label: string,
		readonly editor: Type<any>,
		readonly result: Type<any>,
		readonly collection: RandomCollectionItem<V>[] | undefined = undefined,
		readonly hasArchitectVariable: boolean = false
	) {
		super()
	}

	override evaluate(seed: Seed, data: V): V {
		return data
	}

	override get isConstant(): boolean {
		return true
	}

	static fromTemplate<V = any>(template: ConstantRandomTemplate, label: string, collection?: RandomCollectionItem<V>[]): ConstantRandom<V> {
		return new ConstantRandom(label, template.editor, template.result, collection)
	}
}

export type RandomTemplate<V = any, D = any> = { editor: Type<any>, result: Type<any>, evaluate: (seed: Seed, data: D) => V }

export class ConcreteRandom<V = any, D = any> extends Random<V, D> {

	constructor(
		readonly label: string,
		readonly editor: Type<any>,
		readonly result: Type<any>,
		readonly evaluate: (seed: Seed, data: D) => V,
		readonly collection: RandomCollectionItem<V>[] | undefined = undefined,
		readonly hasArchitectVariable: boolean = false
	) {
		super()
	}

	override get isConstant(): boolean {
		return false
	}

	static fromTemplate<V = any, D = any>(template: RandomTemplate<V, D>, label: string, collection?: RandomCollectionItem<V>[]): ConcreteRandom<V, D> {
		return new ConcreteRandom(label, template.editor, template.result, template.evaluate, collection)
	}
}

export const CONSTANT_RANDOM_TEMPLATES = {
	'ConstantBoolean': { editor: ConstantBooleanComponent, result: RandomBooleanResultComponent },
	'ConstantEnum': { editor: ConstantEnumComponent, result: RandomEnumResultComponent }
}

export const RANDOM_TEMPLATES = {
	'RandomBoolean': { editor: RandomBooleanComponent, result: RandomBooleanResultComponent, evaluate: (seed: Seed, data: number) => seed.next() < data},
	'RandomEnum': { editor: RandomEnumComponent, result: RandomEnumResultComponent, evaluate: (seed: Seed, data: RandomEnumValue[]) => {
		const randomWeight = seed.next() * data.reduce((acc, choice) => acc + choice.weight, 0)
		let cumulative = 0
		for (const choice of data) {
			cumulative += choice.weight
			if (randomWeight < cumulative) {
				return choice.id
			}
		}
		throw new ListEmptyError('RandomEnum/choices')
	} }
}

export const RANDOM_TYPES: Record<string, RandomType> = {
	'boolean': RandomType.simple(CONSTANT_RANDOM_TEMPLATES.ConstantBoolean, RANDOM_TEMPLATES.RandomBoolean, 'Boolean', 'assets/icon/random/boolean.svg'),

	'align': RandomType.simple(CONSTANT_RANDOM_TEMPLATES.ConstantEnum, RANDOM_TEMPLATES.RandomEnum, 'Alignment', 'assets/icon/random/align.svg', [
		{ piIcon: 'pi pi-align-left', label: 'Start', code: 'start' },
		{ piIcon: 'pi pi-align-center', label: 'Center', code: 'center' },
		{ piIcon: 'pi pi-align-right', label: 'End', code: 'end' },
		{ piIcon: 'pi pi-align-justify', label: 'Fill', code: 'fill' }
	])
}

export function registerRandomType(type: { id: string, label?: string, icon?: string, constant: { json: { name: string }, label?: string, collection?: RandomCollectionItem[] }, randoms: Record<string, { json: { name: string }, label?: string, collection?: RandomCollectionItem[] }> }) {
	console.log(type.constant.collection)
	RANDOM_TYPES[type.id] = new RandomType(type.label ?? idToLabel(type.id), type.icon ?? 'assets/icon/undefined.svg', {
		constant: ConstantRandom.fromTemplate((CONSTANT_RANDOM_TEMPLATES as Record<string, ConstantRandomTemplate>)[type.constant.json.name], type.constant.label ?? 'Constant', type.constant.collection?.map((item) => { return { icon: item.icon ? absoluteResourcePath(item.icon) : undefined, piIcon: item.piIcon, label: item.label, code: item.code } })),
		...Object.fromEntries(Object.entries(type.randoms).map(([key, random]) => [key, ConcreteRandom.fromTemplate((RANDOM_TEMPLATES as Record<string, RandomTemplate>)[random.json.name], random.label ?? idToLabel(key), random.collection?.map((item) => { return { icon: item.icon ? absoluteResourcePath(item.icon) : undefined, piIcon: item.piIcon, label: item.label, code: item.code } }))]))
	})
}