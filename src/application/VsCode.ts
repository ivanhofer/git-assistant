'use strict'

import { commands } from 'vscode'

/**
 * this file is a wrapper for VS Code specific methods
 */
export default class VsCode {
	/**
	 * executes a Command registered to VS Code
	 * @param command Command to execute
	 */
	static executeCommand(command: string): void {
		commands.executeCommand(command)
	}
}
