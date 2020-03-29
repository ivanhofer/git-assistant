'use strict'

import { ExtensionContext } from 'vscode'
import Command from './Command'
import Watcher from '../application/Watcher'
import Logger from '../UI/Logger'

/**
 * this class registers a Command to stop the Extension
 */
export default class StopExtension extends Command {
	static registerCommand(context: ExtensionContext): void {
		Command.register(context, 'stopGitAssisitant', StopExtension.stopExtension)
	}

	static registerDummyCommand(context: ExtensionContext): void {
		Command.register(
			context,
			'stopGitAssisitant',
			Logger.showMessage.bind(null, 'you must open a git-repository in your workspace root', true),
		)
	}

	static async stopExtension(): Promise<void> {
		Logger.showMessage('Git Assistant stopped manually')
		Watcher.stop()
	}
}
