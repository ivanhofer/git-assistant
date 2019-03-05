'use static'

import InformationMessage from '../../../UI/InformationMessage'
import MessageOption from '../../../UI/MessageOption'
import QuickPick from '../../../UI/QuickPick'
import QuickPickOption from '../../../UI/QuickPickOption'
import GitRepository from '../../../application/GitRepository'
import ChangeHandler from '../../ChangeHandler'
import Event from '../../../models/Event'
import EventHandler from '../../EventHandler'
import Config, { ConfigOptions } from '../../../application/Config'
import { getRepositoryName } from '../../../application/Helper'

/**
 * this Handler is responsible for checking if a Remote exists for the current Branch
 */
export default class CheckForRemote extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('checkForRemote')) {
			EventHandler.registerHandler(Event.GIT_BRANCH_CHANGED, this)
		}
	}

	static async handle(repositoryPath: string): Promise<void> {
		const gitModel = await GitRepository.getGitModel(repositoryPath)
		const branch = gitModel.getBranch()
		let remote = gitModel.getRemote()

		if (gitModel.isHeadDetached() || remote || remote === null) {
			return
		}

		const remotes = gitModel.getRemotes()

		if (remotes.length && Config.getValue('checkForRemote') !== ConfigOptions.auto) {
			const option = await InformationMessage.showInformationMessage(
				`No remote found for '${getRepositoryName(
					repositoryPath
				)}' on branch '${branch}' Would you like to publish this branch to the remote Server?`,
				MessageOption.optionYES,
				MessageOption.optionNO
			)

			if (option !== MessageOption.YES) {
				return
			}
		}

		// only one Remote exists => choose it
		if (remotes.length === 1) {
			remote = remotes[0]
		} else {
			// a default-Remote is set => choose it
			remote = Config.getValue('checkForRemote-defaultRemote')
			if (!remote) {
				// let the user decide wich Remote he wants to publish the Branch
				const options = remotes.map((remote: string) => new QuickPickOption(remote, remote))

				if (!options.length) {
					return CheckForRemote.noRemoteUpstreamSet(repositoryPath)
				}
				remote = await QuickPick.showQuickPick(`choose a remote to publish the branch '${branch}'`, ...options)
			}
		}

		if (!remote) {
			return
		}

		await GitRepository.publishBranch(repositoryPath, remote, branch)
	}

	private static noRemoteUpstreamSet(repositoryPath: string): void {
		InformationMessage.showInformationMessage(
			`No Remotes found for your Repository '${getRepositoryName(
				repositoryPath
			)}'. You should add a Remote to have a backup in case of data loss.`
		)
	}
}
