'use strict'

import GitRepository from '../../application/GitRepository'
import ChangeHandler from '../ChangeHandler'
import Event from '../../models/Event'
import EventHandler from '../EventHandler'
import GitHandler from '../git/GitHandler.handler'

/**
 * this Handler is responsible for whenever something changed in a Submodule
 */
export default class SubmoduleHandler extends ChangeHandler {
	static registerEventHandler(): void {
		EventHandler.registerHandler(Event.SUBMODULE, this)
	}

	static async handle(changedFiles: string[]): Promise<void> {
		if (!changedFiles) {
			return
		}

		// get submodulePaths of files that have changed
		const gitModel = await GitRepository.getGitModel()
		const submodules = gitModel.getSubmodules()
		const submodulePaths: Set<string> = new Set()
		changedFiles.forEach(changedFile => {
			const founds = submodules
				.filter(submodule => new RegExp(submodule.getPath(), 'gi').test(changedFile))
				.map(submodule => submodule.getPath())
			founds.forEach(found => submodulePaths.add(found))
		})

		for (const submodulePath of submodulePaths) {
			const submoduleModel = await GitRepository.updateGitModel(submodulePath, gitModel.getPath())
			await GitHandler.handleRepositoryChange(submoduleModel)
		}
	}
}
