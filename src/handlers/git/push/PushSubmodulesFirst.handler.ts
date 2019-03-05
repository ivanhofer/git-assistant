'use strict'

import GitRepository from '../../../application/GitRepository'
import ChangeHandler from '../../ChangeHandler'
import Event from '../../../models/Event'
import EventHandler from '../../EventHandler'
import PushCommits from '../commits/PushCommit.handler'
import Config from '../../../application/Config'

/**
 * this Handler is responsible to push all Submodules for a Repository
 */
export default class PushSubmodulesFirst extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('pushSubmodulesFirst')) {
			EventHandler.registerHandler(Event.GIT_PUSH, this)
		}
	}

	static async handle(repositoryPath: string): Promise<void> {
		const gitModel = await GitRepository.getGitModel(repositoryPath)

		for (const submodule of gitModel.getSubmodules()) {
			await PushCommits.handle(submodule.getPath())
		}
	}
}
