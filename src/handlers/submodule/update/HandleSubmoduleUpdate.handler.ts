'use strict'

import InformationMessage from '../../../UI/InformationMessage'
import MessageOption from '../../../UI/MessageOption'
import GitRepository from '../../../application/GitRepository'
import ChangeHandler from '../../ChangeHandler'
import Event from '../../../models/Event'
import EventHandler from '../../EventHandler'
import Config, { ConfigOptions } from '../../../application/Config'
import StatusBar from '../../../UI/StatusBar'
import Status from '../../../UI/Status'

/**
 * this Handler is reponsible for updating Submodule references
 */
export default class HandleSubmoduleUpdate extends ChangeHandler {
	static registerEventHandler(): void {
		EventHandler.registerHandler(Event.SUBMODULE_UPDATE, this)
	}

	static async handle(): Promise<void> {
		if (Config.getValue('updateSubmodules') === ConfigOptions.auto) {
			await GitRepository.submoduleUpdateInit()
			StatusBar.addStatus(Status.submoduleUpdated())

			return
		}

		const action = await InformationMessage.showInformationMessage(
			`Your submodues have updated. Would you like to checkout these commits?`,
			MessageOption.optionYES,
			MessageOption.optionNO
		)

		if (action !== MessageOption.YES) {
			return
		}

		await GitRepository.submoduleUpdateInit()

		StatusBar.addStatus(Status.submoduleUpdated())
	}
}
