'use strict'

import Git from '../../../models/Git'
import InformationMessage from '../../../UI/InformationMessage'
import InputBox from '../../../UI/InputBox'
import MessageOption from '../../../UI/MessageOption'
import QuickPick from '../../../UI/QuickPick'
import QuickPickOption from '../../../UI/QuickPickOption'
import GitRepository from '../../../application/GitRepository'
import ChangeHandler from '../../ChangeHandler'
import Event from '../../../models/Event'
import EventHandler from '../../EventHandler'
import Config, { ConfigOptions } from '../../../application/Config'

/**
 * this Handler is responsible to check if the user works on a wrong Branch
 */
export default class BranchWarn extends ChangeHandler {
	static registerEventHandler(): void {
		if (Config.isEnabled('branchWarn')) {
			EventHandler.registerHandler(Event.GIT_BRANCH_CHANGED, this)
		}
	}

	static async handle(repositoryPath: string): Promise<void> {
		const gitModel = await GitRepository.getGitModel(repositoryPath)
		const currentBranch = gitModel.getBranch()

		if (gitModel.isHeadDetached()) {
			return
		}

		if (Config.getValue('branchWarn-illegalBranches').indexOf(currentBranch) < 0) {
			return
		}

		let message = `You are currently on branch "${currentBranch}"`
		if (!gitModel.isRootGit()) {
			message += ` in Submodule "${repositoryPath}"`
		}
		message += `. You should not commit on this branch. Would you like to switch branch?`
		const action = await InformationMessage.showInformationMessage(
			message,
			MessageOption.optionYES,
			MessageOption.optionNO
		)

		if (action !== MessageOption.YES) {
			return
		}

		// let the user choose a branch to checkout
		const localBranches = gitModel.getLocalBranches()
		const createNewBranchCommand = '[git-assistant][create-new-branch]'
		let branch = ''
		if (localBranches.length > 1) {
			const options: QuickPickOption[] = []
			localBranches.forEach(branch => {
				const branchName = branch.getName()
				if (branchName !== currentBranch) {
					options.push(new QuickPickOption(branchName, branchName))
				}
			})
			options.push(new QuickPickOption('+ create a new branch', createNewBranchCommand))

			branch = await QuickPick.showQuickPick('choose the branch to checkout', ...options)
		}

		if (!branch.length || branch === createNewBranchCommand) {
			branch = await InputBox.showInputBox('enter name of the new branch')
			await GitRepository.createNewBranch(repositoryPath, branch)
		}

		BranchWarn.checkoutWithoutStash(gitModel, branch)
	}

	// tries to checkout a branch
	// iff checkout fails => try to stash before checkout
	private static checkoutWithoutStash = async (gitModel: Git, branch: string): Promise<void> => {
		GitRepository.checkoutBranchForRepository(gitModel.getRelativePath(), branch).catch(() =>
			BranchWarn.checkoutWithStash(gitModel, branch)
		)
	}

	// stashes changes => then checkout
	// asks user in the end if it should pop the latest changes from stash
	private static checkoutWithStash = async (gitModel: Git, branch: string): Promise<void> => {
		const stashed = await BranchWarn.stashBeforeCheckout(gitModel.getPath(), branch)
		if (!stashed) {
			return
		}

		await GitRepository.checkoutBranchForRepository(gitModel.getRelativePath(), branch)

		BranchWarn.stashPopAfterCheckout(gitModel.getPath())
	}

	private static stashBeforeCheckout = async (repositoryPath: string, branch: string): Promise<boolean> => {
		const stashChanges = Config.getValue('branchWarn-stashChanges')
		if (stashChanges === ConfigOptions.disabled) {
			return false
		}

		if (stashChanges === ConfigOptions.auto) {
			GitRepository.stashSaveChanges(repositoryPath)
				.then(() => {
					return true
				})
				.catch(() => {
					return false
				})
		}

		const action = await InformationMessage.showInformationMessage(
			`would you like to stash the current changes before checking out branch '${branch}'? The current changes will be lost`,
			MessageOption.optionYES,
			MessageOption.optionNO
		)

		if (action === MessageOption.NO) {
			return false
		}

		await GitRepository.stashSaveChanges(repositoryPath)

		return true
	}

	private static stashPopAfterCheckout = async (repositoryPath: string): Promise<void> => {
		const action = await InformationMessage.showInformationMessage(
			`would you like to unstash the changes?`,
			MessageOption.optionYES,
			MessageOption.optionNO
		)
		if (action !== MessageOption.YES) {
			return
		}
		await GitRepository.stashPopChanges(repositoryPath)
	}
}
