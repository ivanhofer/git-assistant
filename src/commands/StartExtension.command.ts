'use strict'

import { ExtensionContext } from 'vscode'
import Command from './Command'
import { startExtension } from '../extension'
import Logger from '../UI/Logger'
import EventHandler from '../handlers/EventHandler'
import Config from '../application/Config'

/**
 * this class registers a Command to start the Extension
 */
export default class StartExtension extends Command {
	static registerCommand(context: ExtensionContext): void {
		Command.register(context, 'startGitAssisitant', StartExtension.startExtension)
	}

	static async startExtension(): Promise<void> {
		Logger.showMessage('Git Assistant started manually')

		Config.loadConfig()
		EventHandler.clearAllHandlers()
		startExtension()
	}
}
