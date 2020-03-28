'use strict'

import InformationMessage from '../../../UI/InformationMessage'
import MessageOption from '../../../UI/MessageOption'
import GitRepository from '../../../application/GitRepository'
import ChangeHandler from '../../ChangeHandler'
import Event from '../../../models/Event'
import EventHandler from '../../EventHandler'
import Config, { ConfigOptions } from '../../../application/Config'
import { getRepositoryName } from '../../../application/Helper'

/**
 * this Handler is responsible for pulling changes from a Remote
 */
export default class PullCommits extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('pullCommits')) {
			EventHandler.registerHandler(Event.GIT_COMMITS_REMOTE, this)
		}
	}

	static async handle(repositoryPath: string): Promise<void> {
		const gitModel = await GitRepository.getGitModel(repositoryPath)
		const behind = gitModel.getBehind()
		const remote = gitModel.getRemote()
		const branch = gitModel.getBranch()

		if (!behind) {
			return
		}

		if (Config.getValue('pullCommits') === ConfigOptions.auto) {
			await GitRepository.pullRepository(repositoryPath, remote, branch, behind)

			return
		}

		const action = await InformationMessage.showInformationMessage(
			`You are currently ${behind} commits behind in '${getRepositoryName(
				repositoryPath,
			)}'. Would you like to pull these changes?`,
			MessageOption.optionYES,
			MessageOption.optionNO,
		)

		if (action !== MessageOption.YES) {
			return
		}

		await GitRepository.pullRepository(repositoryPath, remote, branch, behind)
	}
}
