'use strict'

import { ExtensionContext } from 'vscode'
import Commands from './application/Commands'
import Features from './application/Features'
import Event from './models/Event'
import EventHandler from './handlers/EventHandler'
import Logger from './UI/Logger'
import Status from './UI/Status'
import StatusBar from './UI/StatusBar'
import Config from './application/Config'
import { exists } from 'fs'
import { getWorkspacePath } from './application/Helper'

let context: ExtensionContext

// this function is called when the extension is activated for the first time
export const activate = (ctx: ExtensionContext): void => {
	context = ctx

	Logger.init()

	exists(getWorkspacePath() + '/.git', (exists) => {
		if (exists) {
			initExtension()
		} else {
			Commands.registerDummyCommands(context)
		}
	})
}

// this method is called when your extension is deactivated
export const deactivate = (): void => Logger.showMessage('Extension deactivated')

const initExtension = async (): Promise<void> => {
	Config.loadConfig()

	await Commands.registerCommands(context)

	if (!Config.isEnabled('enabled')) {
		Logger.showMessage('Extension is not enabled in settings')

		return
	}
	startExtension()
}

export const startExtension = async (): Promise<void> => {
	StatusBar.initStatusBar(context)

	await Features.enableFeatures()

	const status = Status.startingExtension()
	StatusBar.addStatus(status)

	await EventHandler.handle(Event.START)

	StatusBar.removeStatus(status)
}
