'use strict'

import { commands, workspace } from 'vscode'
import Logger from '../../UI/Logger'
import QuickPick from '../../UI/QuickPick'
import QuickPickOption from '../../UI/QuickPickOption'
import GitRepository from '../../application/GitRepository'
import ChangeHandler from '../ChangeHandler'
import Event from '../../models/Event'
import EventHandler from '../EventHandler'
import Config from '../../application/Config'

/**
 * this Handler is responsible for informing the user he hasn't pushed all changes when closing VS Code
 */
export default class PushBeforeClosingIDE extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('pushBeforeClosingIDE')) {
			EventHandler.registerHandler(Event.EXIT, this)
		}
	}

	static async handle(hardQuit: boolean): Promise<void> {
		if (!hardQuit) {
			commands.executeCommand('workbench.action.closeActiveEditor')
			let fileOpened = false
			const rootPath =
				(workspace.workspaceFolders &&
					workspace.workspaceFolders.length &&
					workspace.workspaceFolders[0].uri.path) ||
				''

			// checks if no more files are opened in the current Window
			workspace.textDocuments.forEach((doc) => {
				if (doc.fileName.includes(rootPath)) {
					fileOpened = true
				}
			})

			if (fileOpened) {
				return
			}
		}

		if (!(await GitRepository.getGitModel()).getAhead()) {
			Logger.showMessage('Editor closed')
			commands.executeCommand(hardQuit ? 'workbench.action.quit' : 'workbench.action.closeWindow')

			return
		}

		const command = await QuickPick.showQuickPick(
			'choose an option',
			new QuickPickOption('Push all changes and close Window', 'pushChanges'),
			QuickPickOption.optionQUIT,
			QuickPickOption.optionCANCEL,
		)
		if (command) {
			if (command === 'pushChanges') {
				await GitRepository.pushRootRepository()
				commands.executeCommand(QuickPickOption.optionQUIT.command)

				return
			}

			commands.executeCommand(command)
		}
	}
}
