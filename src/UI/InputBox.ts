'use strict'

import { window } from 'vscode'
import Logger from './Logger'

export class InputValidation {
	static NOTEMPTY(text: string): string | undefined {
		if (!text || text.length === 0) {
			return 'You must enter something'
		} else {
			return undefined
		}
	}
}

/**
 * this class is a wrapper for the VS Code InputBox
 */
export default class InputBox {
	/**
	 * shows a InputBox in the VS Code Window
	 * @param message message to display
	 * @param validationFunction a function that validates the Input
	 */
	static async showInputBox(message: string, validationFunction: any = InputValidation.NOTEMPTY): Promise<string> {
		const input = await window.showInputBox({
			prompt: message,
			validateInput: validationFunction
		})
		if (input) {
			return input
		}
		Logger.showMessage(`Message not resolved: '${message}'`)

		return ''
	}
}
