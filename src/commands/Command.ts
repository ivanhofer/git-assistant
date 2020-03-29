'use strict'

import { ExtensionContext, commands } from 'vscode'
import Logger from '../UI/Logger'

/**
 * this class is the template for a Command
 */
export default abstract class Command {
	/**
	 * registers a Command in VS Code
	 * @param context VS Code ExtensionContext
	 * @param commandString name of the Command to register
	 * @param command command that should be executed
	 */
	protected static register(context: ExtensionContext, commandString: string, command: any): void {
		context.subscriptions.push(commands.registerCommand('git-assistant.' + commandString, command))
		Logger.showMessage(`[command] ${commandString} registered`)
	}

	/**
	 * this method is called when the Command should register
	 * @param context VS Code ExtensionContext
	 */
	static registerCommand(_context: ExtensionContext): void {
		throw new TypeError('Must override method')
	}

	/**
	 * this method is called when the dummy Command should register
	 * @param context VS Code ExtensionContext
	 */
	static registerDummyCommand(_context: ExtensionContext): void {
		throw new TypeError('Must override method')
	}
}
