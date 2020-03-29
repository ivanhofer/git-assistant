'use strict'

import { ExtensionContext, commands } from 'vscode'
import Event from '../models/Event'
import EventHandler from '../handlers/EventHandler'
import Command from './Command'

/**
 * this class registers a Command that is activated when the user tries to close
 * the VS Code Window with a keyboard-shortcut
 */
export default class PushBeforeClosingIDECommand extends Command {
	static registerCommand(context: ExtensionContext): void {
		Command.register(context, 'pushBeforeClosingIDE', PushBeforeClosingIDECommand.pushBeforeClosingIDE)
		Command.register(context, 'pushBeforeClosingIDEhard', PushBeforeClosingIDECommand.pushBeforeClosingIDEhard)
	}

	static registerDummyCommand(context: ExtensionContext): void {
		Command.register(
			context,
			'pushBeforeClosingIDE',
			commands.executeCommand.bind(null, 'workbench.action.closeActiveEditor'),
		)
		Command.register(context, 'pushBeforeClosingIDEhard', commands.executeCommand.bind(null, 'workbench.action.quit'))
	}

	static async pushBeforeClosingIDE(): Promise<void> {
		await EventHandler.handle(Event.EXIT, false)
	}

	static async pushBeforeClosingIDEhard(): Promise<void> {
		await EventHandler.handle(Event.EXIT, true)
	}
}
