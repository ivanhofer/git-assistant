'use strict'

import { OutputChannel, window } from 'vscode'
import InformationMessage from './InformationMessage'

/**
 * this class handles the logging-output
 */
export default class Logger {
	private static output: OutputChannel

	/**
	 * registers a OutputChannel in VS Code
	 */
	static init(): void {
		Logger.output = window.createOutputChannel('git-assistant')
	}

	/**
	 * shows the Output-Panel
	 */
	static showOutput(): void {
		Logger.output.show()
	}

	/**
	 * logs a message to the OutputChannel
	 * @param message message to show
	 * @param notification display message as InformationMessage or not
	 */
	static showMessage(message: string, notification: boolean = false): void {
		Logger.output.appendLine(getCurrentTimestamp() + message)
		if (notification) {
			InformationMessage.showInformationMessage(message)
		}
	}

	/**
	 * logs an error to the OutputChannel
	 * @param error error to show
	 * @param notification display error as InformationMessage or not
	 */
	static showError(error: string, notification: boolean = false): void {
		Logger.output.appendLine(`[ERROR] ${error}`)
		Logger.output.append('' + new Error().stack)
		if (notification) {
			InformationMessage.showInformationMessage(error)
		}
	}
}

const getCurrentTimestamp = (): string => {
	const now = new Date()
	const hour = prefixWithZeros(now.getHours())
	const minute = prefixWithZeros(now.getMinutes())
	const second = prefixWithZeros(now.getSeconds())

	return `[${hour}:${minute}:${second}] `
}

const prefixWithZeros = (value: number): string => (value < 10 ? '0' : '') + value
