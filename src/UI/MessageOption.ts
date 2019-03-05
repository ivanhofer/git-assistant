'use strict'

import { MessageItem } from 'vscode'

/**
 * this class is a wrapper for VS Code MessageOptions
 */
export default class MessageOption implements MessageItem {
	title: string
	action: string

	constructor(title: string, action: string = title) {
		this.title = title
		this.action = action
	}

	static YES = 'y'
	static NO = 'n'
	static NEVER = 'never'
	static ALWAYS = 'always'
	static optionYES = new MessageOption('yes', MessageOption.YES)
	static optionNO = new MessageOption('no', MessageOption.NO)
	static optionNEVERASKAGAIN = new MessageOption('never ask again', MessageOption.NEVER)
	static optionALWAYS = new MessageOption('always', MessageOption.ALWAYS)
}
