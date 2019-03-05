'use strict'

import { window } from 'vscode'
import Logger from './Logger'
import QuickPickOption from './QuickPickOption'

/**
 * this class is a wrapper for the VS Code QuickPick-Panel
 */
export default class QuickPick {
	/**
	 * shows a QuickPick-Panel in the VS Code Window
	 * @param placeHolder text to display when nothing was chosen
	 * @param options options to choose from
	 */
	static async showQuickPick(placeHolder: string, ...options: QuickPickOption[]): Promise<string> {
		Logger.showMessage('Push-QuickPick shown')

		const option = await window.showQuickPick(options, { placeHolder: placeHolder })
		if (option) {
			return option.command
		}

		Logger.showMessage(`No option chosen`)

		return ''
	}
}
