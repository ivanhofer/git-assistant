'use strict'

import ChangeHandler from '../ChangeHandler'
import EventHandler from '../EventHandler'
import Event from '../../models/Event'
import GitRepository from '../../application/GitRepository'
import GitHandler from '../git/GitHandler.handler'
import Submodule from '../../models/Submodule'

/**
 * this Hanlder initializes all information for each Repository
 */
export default class PerformStartupCheckOfRepositories extends ChangeHandler {
	static registerEventHandler(): void {
		EventHandler.registerHandler(Event.START, this)
	}

	static async handle(): Promise<void> {
		const gitModel = await GitRepository.getGitModel()
		await GitHandler.handleRepositoryChange(gitModel)

		const submodulePaths = gitModel.getSubmodules().map((submodule: Submodule) => submodule.getPath())
		for (const submodulePath of submodulePaths) {
			const submoduleModel = await GitRepository.getGitModel(submodulePath)
			await GitHandler.handleRepositoryChange(submoduleModel)
		}
	}
}
