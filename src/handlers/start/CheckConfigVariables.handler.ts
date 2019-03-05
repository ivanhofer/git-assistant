'use strict'

import InputBox from '../../UI/InputBox'
import Logger from '../../UI/Logger'
import Status from '../../UI/Status'
import StatusBar from '../../UI/StatusBar'
import GitRepository from '../../application/GitRepository'
import ChangeHandler from '../ChangeHandler'
import Event from '../../models/Event'
import EventHandler from '../EventHandler'
import Config from '../../application/Config'

/**
 * this Handler checks for missing config-Variables
 */
export default class CheckConfigVariables extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('checkConfigVariables')) {
			EventHandler.registerHandler(Event.START, this)
		}
	}

	static async handle(): Promise<void> {
		// wich variables should be checked for
		const toCheck = Config.getValue('checkConfigVariables-variablesToCheck')

		let failed: boolean = false
		for (const variable of toCheck) {
			const result = await GitRepository.getConfigVariable(variable).catch(async () => {
				failed = true
				const input = await InputBox.showInputBox(`Config Variable '${variable}' not set. Please enter a value`)
				if (input.length) {
					await GitRepository.setConfigVariable(variable, input, Config.getValue('checkConfigVariables-scope'))
				}
			})
			if (result) {
				Logger.showMessage(`Config Variable '${variable}' is '${result}'`)
			}
		}

		StatusBar.addStatus(Status.allConfigVariablesChecked())
		// if all variables were set => disable this Feature
		if (!failed) {
			Config.disable('checkConfigVariables')
		}
	}
}
