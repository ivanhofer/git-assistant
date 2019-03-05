'use strict'

import { window } from 'vscode'
import Logger from './Logger'
import MessageOption from './MessageOption'
import StatusBar from './StatusBar'
import Status from './Status'
import Config from '../application/Config'

/**
 * this class is a wrapper for the VS Code InfromationMessage
 */
export default class InformationMessage {
	/**
	 * displays a InformationMessage and some Options
	 * @param message message to show
	 * @param options options to display
	 */
	static showInformationMessage(message: string, ...options: MessageOption[]): Promise<string> {
		return new Promise(async (resolve, reject) => {
			let resolved = false

			const timeToWait = Config.getValue('message-wait-time') as number
			// auto-resolve message after a certain time so the Extension will not be blocked
			setTimeout(() => {
				if (!resolved) {
					resolved = true
					resolve('')
				}

				return
			}, timeToWait)

			// display the InformationMessage
			const data: MessageOption | undefined = await window.showInformationMessage(message, {}, ...options)
			if (resolved) {
				StatusBar.addStatus(Status.messageAutoResolved())

				return
			}

			if (data) {
				resolve(data.action)
				resolved = true

				return
			}

			// user dismissed message without clicking on an action
			Logger.showMessage(`Message not resolved: '${message}' `)
			resolve('')

			return
		})
	}
}
