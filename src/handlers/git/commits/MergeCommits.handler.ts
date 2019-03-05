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
 * this Handler is responsible to pull Commits from Remote, merge them and push them to the Remote
 */
export default class MergeCommits extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('mergeCommits')) {
			EventHandler.registerHandler(Event.GIT_COMMITS, this)
		}
	}

	static async handle(repositoryPath: string): Promise<void> {
		const gitModel = await GitRepository.getGitModel(repositoryPath)
		const ahead = gitModel.getAhead()
		const behind = gitModel.getBehind()
		const remote = gitModel.getRemote()
		const branch = gitModel.getBranch()

		if (!(ahead && behind)) {
			return
		}

		if (Config.getValue('mergeCommits') === ConfigOptions.auto) {
			await GitRepository.pullAndPushRepository(repositoryPath, remote, branch, ahead, behind)

			return
		}

		const action = await InformationMessage.showInformationMessage(
			`You are currently behind ${behind} commits. But you also have ${ahead} changes that are currently not on the server for ${getRepositoryName(
				repositoryPath
			)}. Would you like to merge the changes?`,
			MessageOption.optionYES,
			MessageOption.optionNO
		)

		if (action !== MessageOption.YES) {
			return
		}

		await GitRepository.pullAndPushRepository(repositoryPath, remote, branch, ahead, behind)
	}
}
