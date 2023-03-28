'use strict'

import Branch from '../../../models/Branch'
import Git from '../../../models/Git'
import InformationMessage from '../../../UI/InformationMessage'
import Logger from '../../../UI/Logger'
import MessageOption from '../../../UI/MessageOption'
import Status from '../../../UI/Status'
import StatusBar from '../../../UI/StatusBar'
import GitRepository from '../../../application/GitRepository'
import ChangeHandler from '../../ChangeHandler'
import Event from '../../../models/Event'
import EventHandler from '../../EventHandler'
import Config, { ConfigOptions } from '../../../application/Config'
import QuickPickOption from '../../../UI/QuickPickOption'
import QuickPick from '../../../UI/QuickPick'

/**
 * this Handler is responsible for resolving the "detached HEAD" status
 */
export default class DetectDetachedHead extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('detectDetachedHead')) {
			EventHandler.registerHandler(Event.GIT_BRANCH_CHANGED, this)
		}
	}

	static async handle(repositoryPath: string): Promise<void> {
		const gitModel = await GitRepository.getGitModel(repositoryPath)
		if (!gitModel.isHeadDetached()) {
			return
		}

		const branch = await DetectDetachedHead.getRealBranchForHash(gitModel)

		if (!branch.length) {
			return
		}

		if (Config.getValue('detectDetachedHead') === ConfigOptions.auto) {
			await GitRepository.checkoutBranchForRepository(gitModel.getRelativePath(), branch)
			StatusBar.addStatus(Status.autoCheckoutForDetachedHead(gitModel.getRelativePath(), branch))

			return
		}

		let message = `the HEAD of your Repository is detached. Would you like to checkout its corresponding branch '${branch}'?`

		if (!gitModel.isRootGit()) {
			message = `The HEAD of the Submodule '${gitModel.getRelativePath()}' in your Repisotory is detached. Would you like to checkout its corresponding branch '${branch}'?`
		}

		const action = await InformationMessage.showInformationMessage(
			message,
			MessageOption.optionYES,
			MessageOption.optionNO,
		)
		if (action !== MessageOption.YES) {
			return
		}

		await GitRepository.checkoutBranchForRepository(gitModel.getRelativePath(), branch)
	}

	/**
	 * finds the corresponding Branch for a Commit-Hash
	 */
	private static getRealBranchForHash = async (gitModel: Git): Promise<string> => {
		// Get the list of branches that contain the specified commit
		const branches = await GitRepository.getBranchesContain(gitModel)
		// If there is only one, we have found it
		if (branches.length === 1) {
			return branches[0].getName()
		}
		// Otherwise, if we have many options ...
		if (branches.length) {
			// Create a list with the branches names
			const branches_names: string[] = []
			branches.forEach((branch: Branch) => {
				branches_names.push(branch.getName())
			})
			// Check if any of them match with the configured one in .gitmodules
			if (gitModel.getMainRepositoryPath()) {
				const configuredBranch = await GitRepository.getConfiguredBranchForSubmodule(gitModel)
				if (configuredBranch && branches_names.includes(configuredBranch)) {
					return configuredBranch
				}
			}
			// Otherwise ask the user
			const options: QuickPickOption[] = branches_names.map((branch) => new QuickPickOption(branch, branch))
			const selectedBranch = await QuickPick.showQuickPick('choose the branch to check out', ...options)
			if (selectedBranch) {
				return selectedBranch
			}
		}
		// If no branch contains the current commit, just warn the user
		const current = gitModel.getBranch()
		Logger.showError(
			`could not find branch for '${current}' ${
				!gitModel.isRootGit() ? ` in Submodule '${gitModel.getRelativePath()}'` : ''
			}. You have to checkout the branch manually.`,
			true,
		)
		return ''
	}
}
