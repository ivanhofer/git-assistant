'use strict'

import Git from '../../models/Git'
import GitRepository from '../../application/GitRepository'
import ChangeHandler from '../ChangeHandler'
import Event from '../../models/Event'
import EventHandler from '../EventHandler'

/**
 * this Handler is responsible for changes in the Git-Repository
 */
export default class GitHandler extends ChangeHandler {
	static registerEventHandler(): void {
		EventHandler.registerHandler(Event.GIT, this)
	}

	static async handle(): Promise<void> {
		const gitModel = await GitRepository.updateGitModel()
		await GitHandler.handleRepositoryChange(gitModel)
	}

	/**
	 * checks for changes in a given Git-Repository
	 * @param gitModel gitModel to check for changes
	 */
	static async handleRepositoryChange(gitModel: Git): Promise<Git> {
		const repositoryPath = gitModel.getRelativePath()
		const modelDiff = await GitRepository.getModelDiff(repositoryPath)

		// nothing important changed (except timestamp and oldGitModel)
		if (Object.keys(modelDiff).length < 2) {
			return gitModel
		}

		const ahead = modelDiff.ahead > 0
		const behind = modelDiff.behind > 0
		if (!modelDiff.detachedHEAD) {
			if (ahead && behind) {
				await EventHandler.handle(Event.GIT_COMMITS, repositoryPath)
			} else if (ahead) {
				await EventHandler.handle(Event.GIT_COMMITS_LOCAL, repositoryPath)
			} else if (behind) {
				await EventHandler.handle(Event.GIT_COMMITS_REMOTE, repositoryPath)
			}
		}

		if (modelDiff.branch !== undefined) {
			await EventHandler.handle(Event.GIT_BRANCH_CHANGED, repositoryPath)
		}

		if (modelDiff.modifiedSubmodules && modelDiff.modifiedSubmodules.length) {
			await EventHandler.handle(Event.SUBMODULE_UPDATE)
		}

		return gitModel
	}
}
