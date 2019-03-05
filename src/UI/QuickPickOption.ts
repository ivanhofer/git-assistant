'use strict'

import { QuickPickItem } from 'vscode'

/**
 * this class is a wrapper for the VS Code QuickPickOptions
 */
export default class QuickPickOption implements QuickPickItem {
	label: string
	command: string
	description: string

	constructor(label: string, command: string, description: string = '') {
		this.label = label
		this.command = command
		this.description = description
	}

	static optionCANCEL = new QuickPickOption('Cancel', 'search.action.focusActiveEditor', 'ESC')
	static optionQUIT = new QuickPickOption('Close Window', 'workbench.action.quit')
}
