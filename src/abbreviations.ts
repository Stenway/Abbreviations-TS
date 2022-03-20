/* (C) Stefan John / Stenway / SimpleML.com / 2022 */

import { SmlDocument, SmlElement, SmlAttribute } from "./sml.js"

// ----------------------------------------------------------------------

export class Abbreviations {
	private abbreviations: Map<string, string[]> = new Map<string, string[]>()
	
	language: string | null = null
	source: string | null = null

	has(abbreviation: string): boolean {
		return this.abbreviations.has(abbreviation)
	}

	get(abbreviation: string): string[] {
		if (!this.has(abbreviation)) { throw new Error(`Abbreviation "${abbreviation}" does not exist`) }
		let result: string[] = this.abbreviations.get(abbreviation)!
		return [...result]
	}

	add(abbreviation: string, explanation: string) {
		let values: string[] = []
		if (this.has(abbreviation)) {
			values = this.abbreviations.get(abbreviation)!
		}
		values.push(explanation)
		this.abbreviations.set(abbreviation, values)
	}

	getKeys(): string[] {
		return Array.from(this.abbreviations.keys()).sort((a: string, b: string) => { return a.localeCompare(b) } )
	}

	asArray(): string[][] {
		let keys: string[] = this.getKeys()
		let array: string[][] = []
		for (let key of keys) {
			let values: string[] = this.abbreviations.get(key)!
			array.push([key, ...values])
		}
		return array
	}

	asSmlDocument(): SmlDocument {
		let rootElement: SmlElement = new SmlElement("Abbreviations")
		if (this.language !== null) {
			let metaElement: SmlElement = rootElement.addElement("Meta")
			if (this.language !== null) { metaElement.addAttribute("Language", [this.language]) }
			if (this.source !== null) { metaElement.addAttribute("Source", [this.source]) }
		}
		for (let key of this.getKeys()) {
			let values: string[] = this.abbreviations.get(key)!
			rootElement.addAttribute(key, values)
		}
		return new SmlDocument(rootElement)
	}

	toString(pretty: boolean = true): string {
		let document: SmlDocument = this.asSmlDocument()
		if (pretty) {
			document.root.alignAttributes(" ", 1)
		}
		return document.toString()
	}

	private load(document: SmlDocument) {
		let rootElement: SmlElement = document.root
		rootElement.assureName("Abbreviations")
		rootElement.assureElementNames(["Meta"])
		let metaElement: SmlElement | null = rootElement.optionalElement("Meta")
		if (metaElement !== null) {
			let languageAttribute: SmlAttribute | null = metaElement.optionalAttribute("Language")
			if (languageAttribute !== null) { this.language = languageAttribute.asString() }

			let sourceAttribute: SmlAttribute | null = metaElement.optionalAttribute("Source")
			if (sourceAttribute !== null) { this.source = sourceAttribute.asString() }
		}
		for (let attribute of rootElement.attributes()) {
			for (let value of attribute.asStringArray()) {
				this.add(attribute.name, value)
			}
		}
	}

	static parse(content: string): Abbreviations {
		let abbreviations: Abbreviations = new Abbreviations()
		let document: SmlDocument = SmlDocument.parse(content)
		abbreviations.load(document)
		return abbreviations
	}
}