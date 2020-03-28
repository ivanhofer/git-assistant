'use strict'

import StatusItem from './StatusItem'
import { getRepositoryName } from '../application/Helper'

/**
 * this class generates all Status Messages
 */
export default class Status {
	static startingExtension(): StatusItem {
		return StatusItem.newAnimatedStatusItem(`loading git-assistant`)
	}
	static watcherRunning(): StatusItem {
		return new StatusItem('git-assistant running')
	}
	static watcherRestarted(): StatusItem {
		return StatusItem.newTemporaryStatusItem('git-assistant restarted')
	}
	static configVariableSet(variable: string, input: string): StatusItem {
		return StatusItem.newTemporaryStatusItem(`git-config variable '${variable}' set to '${input}'`)
	}
	static allConfigVariablesChecked(): StatusItem {
		return StatusItem.newTemporaryStatusItem(`all git-config variables checked`)
	}

	static autoCheckoutForDetachedHead(repositoryPath: string, branch: string) {
		const message = `DetachedHEAD detected: auto-checked out '${branch}'`

		return StatusItem.newTemporaryStatusItem(addSubmoduleText(message, repositoryPath))
	}

	static updatingGitModel(repositoryPath: string): StatusItem {
		return StatusItem.newAnimatedStatusItem(`checking repository '${getRepositoryName(repositoryPath)}'`)
	}

	static publishBranch(repositoryPath: string, remote: string, branch: string): StatusItem {
		return StatusItem.newAnimatedStatusItem(
			`publishing branch '${branch}' to remote '${remote}' for '${getRepositoryName(repositoryPath)}'`,
		)
	}

	static branchIsUpToDate(repositoryPath: string, remote: string, branch: string): StatusItem {
		const message = `branch '${getBranchName(remote, branch)}' is up-to-date`

		return StatusItem.newTemporaryStatusItem(addSubmoduleText(message, repositoryPath))
	}
	static commitsPushed(repositoryPath: string, remote: string, branch: string, ahead: number = 0): StatusItem {
		const message = `${ahead} commits pushed to '${getBranchName(remote, branch)}'`

		return StatusItem.newTemporaryStatusItem(addSubmoduleText(message, repositoryPath))
	}
	static commitsPushing(repositoryPath: string, remote: string, branch: string, ahead: number = 0): StatusItem {
		const message = `pushing ${ahead} commits to '${getBranchName(remote, branch)}'`

		return StatusItem.newAnimatedStatusItem(addSubmoduleText(message, repositoryPath))
	}
	static commitsPulled(repositoryPath: string, remote: string, branch: string, behind: number = 0): StatusItem {
		const message = `${behind} commits pulled from '${getBranchName(remote, branch)}'`

		return StatusItem.newTemporaryStatusItem(addSubmoduleText(message, repositoryPath))
	}
	static commitsPulling(repositoryPath: string, remote: string, branch: string, behind: number = 0): StatusItem {
		const message = `pulling ${behind} commits from '${getBranchName(remote, branch)}'`

		return StatusItem.newAnimatedStatusItem(addSubmoduleText(message, repositoryPath))
	}
	static commitsMerged(
		repositoryPath: string,
		remote: string,
		branch: string,
		ahead: number = 0,
		behind: number = 0,
	): StatusItem {
		const message = `${ahead} / ${behind} commits merged on '${getBranchName(remote, branch)}'`

		return StatusItem.newTemporaryStatusItem(addSubmoduleText(message, repositoryPath))
	}
	static commitsMerging(
		repositoryPath: string,
		remote: string,
		branch: string,
		ahead: number = 0,
		behind: number = 0,
	): StatusItem {
		const message = `merging ${ahead} / ${behind} commits on '${getBranchName(remote, branch)}'`

		return StatusItem.newAnimatedStatusItem(addSubmoduleText(message, repositoryPath))
	}

	static checkedOutRepositoryBranch(repositoryPath: string, branch: string): StatusItem {
		const message = `Checked out '${branch}'`

		return StatusItem.newTemporaryStatusItem(addSubmoduleText(message, repositoryPath))
	}

	static stashSaveChanges(): StatusItem {
		return StatusItem.newTemporaryStatusItem(`changes saved to stash`)
	}
	static stashPopChanges(): StatusItem {
		return StatusItem.newTemporaryStatusItem(`changes popped from stash`)
	}

	static branchCreated(branch: string): StatusItem {
		return StatusItem.newTemporaryStatusItem(`new branch '${branch}' created`)
	}

	static submoduleUpdated(): StatusItem {
		return StatusItem.newTemporaryStatusItem(`Submodules updated`)
	}

	static messageAutoResolved(): StatusItem {
		return StatusItem.newTemporaryStatusItem(`message was already auto-resolved - no action performed`)
	}
}

const addSubmoduleText = (message: string, repositoryPath: string): string => {
	if (repositoryPath.length) {
		message += ` in Submodule '${repositoryPath}'`
	}

	return message
}

const getBranchName = (remote: string, branch: string): string => (remote ? `${remote}/` : '') + branch
