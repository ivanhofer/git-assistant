'use strict'

import { ExtensionContext } from 'vscode'
import PushBeforeClosingIDECommand from '../commands/PushBeforeClosingIDE.command'
import ShowOutputCommand from '../commands/ShowOutput.command'
import StartExtension from '../commands/StartExtension.command'
import StopExtension from '../commands/StopExtension.command'

const COMMANDS = [PushBeforeClosingIDECommand, ShowOutputCommand, StartExtension, StopExtension]
/**
 * this class registers all commands displayed in the VS Code Command Pallette
 */
export default class Commands {
	/**
	 * registers all Commands as a Command in VS Code
	 * @param context VS Code ExtensionContext
	 */
	static registerCommands(context: ExtensionContext): void {
		COMMANDS.forEach((command) => {
			command.registerCommand(context)
		})
	}

	/**
	 * registers dummy Commands as a Command in VS Code so it will not throw an Exception when the Extension
	 * is not loaded
	 * @param context VS Code ExtensionContext
	 */
	static registerDummyCommands(context: ExtensionContext): void {
		COMMANDS.forEach((command) => {
			command.registerDummyCommand(context)
		})
	}
}
