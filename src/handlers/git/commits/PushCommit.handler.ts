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
 * this Handler is responsible for pushing changes to the Remote
 */
export default class PushCommits extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('pushCommits')) {
			EventHandler.registerHandler(Event.GIT_COMMITS_LOCAL, this)
		}
	}

	static async handle(repositoryPath: string): Promise<void> {
		const gitModel = await GitRepository.getGitModel(repositoryPath)
		const ahead = gitModel.getAhead()
		const remote = gitModel.getRemote()
		const branch = gitModel.getBranch()

		if (!ahead) {
			return
		}

		if (Config.getValue('pushCommits') === ConfigOptions.auto) {
			await PushCommits.push(repositoryPath, remote, branch, ahead)

			return
		}

		const action = await InformationMessage.showInformationMessage(
			`You have ${ahead} changes that are currently not on the server for ${getRepositoryName(
				repositoryPath,
			)}. Would you like to push the changes?`,
			MessageOption.optionYES,
			MessageOption.optionNO,
		).catch(() => {})

		if (action !== MessageOption.YES) {
			return
		}

		await PushCommits.push(repositoryPath, remote, branch, ahead)
	}

	private static async push(repositoryPath: string, remote: string, branch: string, ahead: number): Promise<void> {
		await EventHandler.handle(Event['GIT_PUSH'], repositoryPath)
		await GitRepository.pushRepository(repositoryPath, remote, branch, ahead)
	}
}
