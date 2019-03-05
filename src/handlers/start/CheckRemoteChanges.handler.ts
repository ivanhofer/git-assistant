'use strict'

import ChangeHandler from '../ChangeHandler'
import EventHandler from '../EventHandler'
import Event from '../../models/Event'
import GitRepository from '../../application/GitRepository'
import StatusBar from '../../UI/StatusBar'
import Status from '../../UI/Status'
import Git from '../../models/Git'
import GitHandler from '../git/GitHandler.handler'
import Config from '../../application/Config'

/**
 * this Handler checks periodically for new Commits on the Remote
 */
export default class CheckRemoteChanges extends ChangeHandler {
	static iterations = 0
	static registerEventHandler(): void {
		if (Config.isEnabled('checkRemoteChanges')) {
			EventHandler.registerHandler(Event.START, this)
		}
	}

	static async handle(repositoryPath: string = ''): Promise<void> {
		const gitModel = !CheckRemoteChanges.iterations
			? await GitRepository.getGitModel(repositoryPath)
			: await GitRepository.updateGitModel(repositoryPath)

		CheckRemoteChanges.nextCheck(gitModel)

		// do nothing on first call, because there exist other Handlers for that
		if (!CheckRemoteChanges.iterations++) {
			return
		}

		await GitHandler.handleRepositoryChange(gitModel)

		const ahead = gitModel.getAhead()
		const behind = gitModel.getBehind()
		const remote = gitModel.getRemote()
		const branch = gitModel.getBranch()

		if (!remote.length) {
			return CheckRemoteChanges.nextCheck(gitModel)
		}

		// display message that all is up-to-date
		if (!ahead && !behind) {
			StatusBar.addStatus(Status.branchIsUpToDate(gitModel.getRelativePath(), remote, branch))
		}

		// check all Submodules
		for (const submodulePath of gitModel.getSubmodules().map(submodule => submodule.getPath())) {
			await CheckRemoteChanges.handle(submodulePath)
		}
	}

	/**
	 * plans the next execution of the check if it is the root-Repository
	 * @param gitModel current Model of a Repository
	 */
	private static nextCheck(gitModel: Git): void {
		if (!gitModel.isRootGit()) {
			return
		}

		const checkEveryNMinutes = Config.getValue('checkRemoteChanges-checkEveryNMinutes')
		if (checkEveryNMinutes) {
			setTimeout(() => {
				if (!GitRepository.isCurrentlyUpdating()) {
					CheckRemoteChanges.handle()
				}
			}, checkEveryNMinutes * 1000 * 60)
		}
	}
}
