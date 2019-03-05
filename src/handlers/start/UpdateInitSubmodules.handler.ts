'use strict'

import ChangeHandler from '../ChangeHandler'
import EventHandler from '../EventHandler'
import Event from '../../models/Event'
import Config from '../../application/Config'
import GitRepository from '../../application/GitRepository'

/**
 * this Hanlder updates all Submodules on Extension-start
 */
export default class UpdateInitSubmodules extends ChangeHandler {
	static iterations = 0
	static registerEventHandler(): void {
		if (Config.isEnabled('updateSubmodules')) {
			EventHandler.registerHandler(Event.START, this)
		}
	}

	static async handle(): Promise<void> {
		await GitRepository.submoduleUpdateInit()
	}
}
