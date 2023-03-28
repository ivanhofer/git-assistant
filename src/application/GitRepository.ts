'use strict'

import { join } from 'path'
import { readFile } from 'fs'
import Git from '../models/Git'
import Submodule from '../models/Submodule'
import Branch from '../models/Branch'
import Logger from '../UI/Logger'
import Status from '../UI/Status'
import StatusBar from '../UI/StatusBar'
import StatusItem from '../UI/StatusItem'
import CMD from './CMD'
import { diff as deepdiff } from 'deep-diff'
import { getWorkspacePath, deepmerge } from './Helper'

const unimportantGitFiles: string[] = ['lock', 'FETCH_HEAD', '.git/objects/']

/**
 * this class handles the communication with the Git-Repository
 */
export default class GitRepository {
	private static gitModels: Map<string, Git> = new Map()
	private static simplegits: Map<string, any> = new Map()

	private static isUpdating: boolean = false

	/**
	 * deletes all Git-Models and simple-git instances
	 */
	static reset(): void {
		GitRepository.gitModels = new Map()
		GitRepository.simplegits = new Map()
	}

	/**
	 * creates a new simple-git instance or returns a existing one
	 * @param repositoryPath relative path of the Repsoitory
	 */
	private static getSimplegit(repositoryPath: string = ''): any {
		if (GitRepository.simplegits.has(repositoryPath)) {
			return GitRepository.simplegits.get(repositoryPath)
		}
		const simplegit = require('simple-git/promise')(join(getWorkspacePath(), repositoryPath))
		GitRepository.simplegits.set(repositoryPath, simplegit)

		return simplegit
	}

	/**
	 * returns the current status as Git-Model
	 * @param repositoryPath relative path of the Repsoitory
	 */
	static async getGitModel(repositoryPath: string = '', mainRepositoryPath: string = ''): Promise<Git> {
		repositoryPath = repositoryPath.replace(/\\/gi, '/')

		let gitModel = GitRepository.gitModels.get(repositoryPath)
		if (gitModel) {
			return gitModel
		}

		// no Git-Model was created yet => create a new one
		gitModel = await GitRepository.updateGitModel(repositoryPath, mainRepositoryPath)

		return gitModel
	}

	/**
	 * sets a Git-Model as current status of the Repository
	 * @param repositoryPath relative path of the Repsoitory
	 * @param gitModel Git-Model to set as current
	 */
	private static setGitModel(repositoryPath: string = '', gitModel: Git): void {
		repositoryPath = repositoryPath.replace(/\\/gi, '/')
		const oldModel = GitRepository.gitModels.get(repositoryPath)
		GitRepository.gitModels.set(repositoryPath, gitModel)

		// store the old Git-Model in the new one
		if (oldModel) {
			gitModel.setOldModel(oldModel)
		}
	}

	/**
	 * checks if a given file is an unimportant file that contains no Status-change-infomrmation
	 * @param filename file to check
	 */
	static async isUnimportantGitFile(filename: string): Promise<boolean> {
		// root git folder
		if (filename.length === 4) {
			return true
		}
		// unimportant file
		if (unimportantGitFiles.some((file: string) => new RegExp(file, 'gi').test(filename))) {
			return true
		}
		// submodule references
		const subModuleRoots = (await GitRepository.getGitModel())
			.getSubmodules()
			.filter((submodule) => '.git/modules/' + submodule.getPath() === filename)
		if (subModuleRoots.length) {
			return true
		}

		return false
	}

	/**
	 * checks if a change occured in a Submodule-Repsoitory
	 * @param filename file to check
	 */
	static isChangeInSubmodule(filename: string): boolean {
		return new RegExp('.git/modules/', 'gi').test(filename)
	}

	/**
	 * checks if a file is located in a Submodule
	 * @param filename file to check
	 */
	static async isFileInSubmodule(filename: string): Promise<string> {
		const submodule = (await GitRepository.getGitModel())
			.getSubmodules()
			.find((submodule: Submodule) => new RegExp(submodule.getPath(), 'gi').test(filename))

		return submodule ? submodule.getPath() : ''
	}

	/**
	 * checks if the Extension is currently executing a Git-Command
	 */
	static isCurrentlyUpdating(): boolean {
		return GitRepository.isUpdating
	}

	/**
	 * marks the begin of a Git-Command
	 */
	private static updatingStart(): void {
		GitRepository.isUpdating = true
	}

	/**
	 * marks the end of a Git-Command
	 * @param repositoryPath relative path of the Repsoitory
	 * @param branch current Branch of the Repository
	 */
	private static updatingEnd(repositoryPath: string, branch?: string): void {
		GitRepository.updateGUI(repositoryPath, branch)
		GitRepository.isUpdating = false
	}

	/**
	 * hack for updating the VS Code GUI
	 * @param repositoryPath relative path of the Repsoitory
	 * @param branch current Branch of the repository
	 */
	static async updateGUI(repositoryPath: string, branch?: string): Promise<void> {
		if (!repositoryPath.length) {
			return
		}

		const simplegit = GitRepository.getSimplegit(repositoryPath)

		const oldBranch = branch ? branch : (await GitRepository.getGitModel(repositoryPath)).getBranch()
		const helperBranch = oldBranch !== 'master' ? 'master' : 'development'
		let helperBranchExists = false

		// checkout other Branch
		await simplegit.checkoutLocalBranch(helperBranch).catch(() => (helperBranchExists = true))
		if (helperBranchExists) {
			await simplegit.checkout(helperBranch)
		}

		// wait a short time to switch back to the original Branch
		setTimeout(async () => {
			await simplegit.checkout(oldBranch)

			if (!helperBranchExists) {
				simplegit.deleteLocalBranch(helperBranch)
			}

			Logger.showMessage('VS Code SCM-GUI updated')
		}, 10)
	}

	/*******************************************************************************************/
	/* UPDATE GIT MODEL */
	/*******************************************************************************************/

	/**
	 * reads the current Status of the Repsoitory
	 * @param repositoryPath relative path of the Repsoitory
	 */
	static async updateGitModel(repositoryPath: string = '', mainRepositoryPath: string = ''): Promise<Git> {
		let simplegit
		try {
			simplegit = GitRepository.getSimplegit(repositoryPath)
		} catch (error) {
			Logger.showMessage(`Repository path ${repositoryPath} not found`)

			return new Git()
		}
		const gitModel = new Git(repositoryPath)

		try {
			// fetch latest changes from Remote
			await simplegit.fetch()
		} catch (error) {
			if (error.message.indexOf('unable to access')) {
				Logger.showMessage(`[repository] could not connect to Server`)
			} else {
				Logger.showMessage(`[repository] No remote repository found for ${repositoryPath}`)
			}
		}

		if (mainRepositoryPath) {
			gitModel.setMainRepositoryPath(mainRepositoryPath)
		}

		const stat = Status.updatingGitModel(repositoryPath)
		StatusBar.addStatus(stat)

		const status = await simplegit.status()

		gitModel.setBehind(status.behind)
		gitModel.setAhead(status.ahead)
		gitModel.setBranch(status.current)
		if (status.tracking) {
			gitModel.setRemote(status.tracking.split('/')[0])
		}

		const branches = await simplegit.branch()
		if (gitModel.getBranch() === 'HEAD') {
			gitModel.setBranch(branches.current)
		}
		gitModel.setDetachedHEAD(branches.detached)

		gitModel.setBranches(branches.branches)

		const remotes = await simplegit.getRemotes()
		gitModel.setRemotes(remotes)

		const result = await CMD.executeCommand('git submodule', gitModel.getPath())
		gitModel.setSubmodules(result.replace(/\r?\n|\r/g, ' ').replace('  ', ' '))

		GitRepository.setGitModel(repositoryPath, gitModel)

		StatusBar.removeStatus(stat)

		return gitModel
	}

	/*******************************************************************************************/
	/* GIT MODEL DIFF */
	/*******************************************************************************************/

	/**
	 * returns a diff of the last two Git-Models
	 * @param repositoryPath relative path of the Repsoitory
	 */
	static async getModelDiff(repositoryPath: string = ''): Promise<any> {
		const newModel = await GitRepository.getGitModel(repositoryPath)
		const oldModel = newModel.getOldModel()

		if (!oldModel) {
			return newModel
		}

		const tempDiff = deepdiff(newModel, oldModel) || []

		let diff: any = {}
		// converts the deep-diff object to a Git-Model
		tempDiff.forEach((object: any) => {
			if (object.path[0] === 'oldModel') {
				return
			}

			let pathPointer = object.lhs
			object.path.reverse().forEach((pathSegment: string) => {
				const obj: any = {}
				obj[pathSegment] = pathPointer
				pathPointer = obj
			})

			if (pathPointer.branches) {
				pathPointer.branches = undefined
			}

			diff = deepmerge(diff, pathPointer)
		})

		return diff
	}

	/*******************************************************************************************/
	/* INIT */
	/*******************************************************************************************/

	/**
	 * inits a new Git-Repository
	 */
	static async init(): Promise<void> {
		const gitInstance = GitRepository.getSimplegit()
		await gitInstance.init()
		await gitInstance.add('./*')
		await gitInstance.commit('first commit')
	}

	/*******************************************************************************************/
	/* CONFIG-VARIABLES */
	/*******************************************************************************************/

	/**
	 * returns the value of a given config-variable-name
	 * @param variable name of the config-variable
	 */
	static getConfigVariable(variable: string): Promise<string> {
		return new Promise((resolve, reject) => {
			CMD.executeCommand(`git config --get ${variable}`)
				.then((result) => {
					if (!result.length) {
						return reject()
					}
					resolve(result)
				})
				.catch(reject)
		})
	}

	/**
	 * sets the value of a Git config-variable
	 * @param variable name of the config-variable
	 * @param value value to set
	 * @param scope global or local scope
	 */
	static async setConfigVariable(
		variable: string,
		value: string,
		scope: 'global' | 'local' = 'global',
	): Promise<void> {
		await CMD.executeCommand(`git config --${scope} ${variable} ${value}`).catch(() => {
			Logger.showError(`An Error occured while trying to set '${variable}'`)

			return
		})

		StatusBar.addStatus(Status.configVariableSet(variable, value))
	}

	/*******************************************************************************************/
	/* PUBLISH BRANCH */
	/*******************************************************************************************/

	/**
	 * publishes a Branch to a given remote
	 * @param repositoryPath relative path of the Repsoitory
	 * @param remote remote to publish
	 * @param branch branch to publish
	 */
	static async publishBranch(repositoryPath: string, remote: string, branch: string): Promise<void> {
		const status = Status.publishBranch(repositoryPath, remote, branch)
		StatusBar.addStatus(status)
		GitRepository.updatingStart()

		await GitRepository.getSimplegit(repositoryPath).push(remote, branch, { '-u': null }).catch()

		GitRepository.updatingEnd(repositoryPath)
		StatusBar.removeStatus(status)
	}

	/*******************************************************************************************/
	/* BRANCHES */
	/*******************************************************************************************/

	/**
	 * creates a new Branch
	 * @param repositoryPath relative path of the Repsoitory
	 * @param branch Branch to create
	 */
	static async createNewBranch(repositoryPath: string = '', branch: string): Promise<void> {
		await GitRepository.getSimplegit(repositoryPath).checkoutLocalBranch(branch)
		Status.branchCreated(branch)
	}

	/**
	 * checks out a branch
	 * @param repositoryPath relative path of the Repsoitory
	 * @param branch name of the Branch
	 */
	static async checkoutBranchForRepository(repositoryPath: string, branch: string): Promise<void> {
		GitRepository.updatingStart()

		await GitRepository.getSimplegit(repositoryPath)
			.checkout(branch)
			.catch(() => {
				let message = `could not checkout branch '${branch}'`
				if (repositoryPath.length) {
					message += ` in Submodule '${repositoryPath}'`
				}
				Logger.showError(message)
				GitRepository.updatingEnd(repositoryPath, branch)

				return
			})

		StatusBar.addStatus(Status.checkedOutRepositoryBranch(repositoryPath, branch))
		GitRepository.updatingEnd(repositoryPath, branch)
	}

	/**
	 * add changes to Stash
	 * @param repositoryPath relative path of the Repsoitory
	 */
	static async stashSaveChanges(repositoryPath: string): Promise<void> {
		GitRepository.updatingStart()
		await CMD.executeCommand('git stash save', repositoryPath).catch(() => {
			GitRepository.updatingEnd(repositoryPath)
			Logger.showError(`An Error occured while stash changes`, true)

			return
		})

		StatusBar.addStatus(Status.stashSaveChanges())
		GitRepository.updatingEnd(repositoryPath)
	}

	/**
	 * restores changes from Stash
	 * @param repositoryPath relative path of the Repsoitory
	 */
	static async stashPopChanges(repositoryPath: string): Promise<void> {
		GitRepository.updatingStart()
		await CMD.executeCommand('git stash pop', repositoryPath).catch(() => {
			GitRepository.updatingEnd(repositoryPath)
			Logger.showError(`An Error occured while trying to pop from stash`, true)

			return
		})

		StatusBar.addStatus(Status.stashPopChanges())
		GitRepository.updatingEnd(repositoryPath)
	}

	/**
	 * checks the '.gitmodules' file for a configured branch
	 * @param gitModel Git-Model of Submodule
	 */
	static async getConfiguredBranchForSubmodule(gitModel: Git): Promise<string> {
		return new Promise((resolve) => {
			const mainRepsoitoryPath = gitModel.getMainRepositoryPath()
			const submodulePath = gitModel.getRelativePath()

			readFile(join(mainRepsoitoryPath, '/.gitmodules'), 'utf8', (err, data: string) => {
				if (!data) {
					return resolve('')
				}

				const lines = data.match(/[^\r\n]+/g) || ([] as RegExpMatchArray)
				let foundSubmodule = false
				lines.forEach((line) => {
					if (line.includes('[submodule')) {
						foundSubmodule = line.includes(submodulePath)
					} else if (foundSubmodule) {
						if (line.includes('branch')) {
							return resolve(line.replace('branch =', '').trim())
						}
					}
				})

				resolve('')
			})
		})
	}

	/**
	 * Get the list of branches that conatining current commit
	 * @param gitModel Git-Model of Submodule
	 */
	static async getBranchesContain(gitModel: Git): Promise<Branch[]> {
		let simplegit = GitRepository.getSimplegit(gitModel.getRelativePath())
		const branches_local = await simplegit.branch(['--contains', gitModel.getBranch()])
		const branches_remote = await simplegit.branch(['--remote', '--contains', gitModel.getBranch()])
		let branches : Branch[] = []
		let branches_local_names : string[] = []
		let discardfirst : boolean = branches_local.detached
		branches_local.all.forEach((key: any) => {
			// Discard the first local branch if detached (it is our detached branch)
			if (discardfirst) {
				discardfirst = false
			} else {
				branches.push(new Branch(branches_local.branches[key].name, branches_local.branches[key].commit))
				branches_local_names.push(branches_local.branches[key].name)
			}
		})
		branches_remote.all.forEach((key: any) => {
			// Get the branch name by removing the first part before slash which is the origin
			let name = branches_remote.branches[key].name.split("/",2)[1]
			// Make sure that we don't add twice a remote branch and local branch
			if (!branches_local_names.includes(name)) {
				branches.push(new Branch(name, branches_remote.branches[key].commit))
			}
		})
		return branches
	}
	
	/*******************************************************************************************/
	/* PULL */
	/*******************************************************************************************/

	/**
	 * pulls changes from Remote
	 * @param repositoryPath relative path of the Repsoitory
	 * @param remote name of the Remote
	 * @param branch name of the Branch
	 * @param behind number of commits behind
	 * @param silent iff true => don't show messages
	 */
	static async pullRepository(
		repositoryPath: string,
		remote: string,
		branch: string,
		behind: number = 0,
		silent: boolean = false,
	): Promise<void> {
		const status = Status.commitsPulling(repositoryPath, remote, branch, behind)
		if (!silent) {
			GitRepository.updatingStart()
			StatusBar.addStatus(status)
		}
		await GitRepository.getSimplegit(repositoryPath)
			.pull(remote, branch)
			.catch((error: any) => {
				Logger.showError(`Failed to Pull changes from '${remote}/${branch}'`, true)
				Logger.showError(error, true)
				if (!silent) {
					StatusBar.removeStatus(status)
					GitRepository.updatingEnd(repositoryPath)
				}

				return
			})

		if (!silent) {
			StatusBar.addStatus(Status.commitsPulled(repositoryPath, remote, branch, behind))
			StatusBar.removeStatus(status)
			GitRepository.updatingEnd(repositoryPath)
		}
	}

	/*******************************************************************************************/
	/* PUSH */
	/*******************************************************************************************/

	/**
	 * pushes changes to Remote
	 * @param repositoryPath relative path of the Repsoitory
	 * @param remote name of the Remote
	 * @param branch name of the Branch
	 * @param ahead number of commits ahead
	 * @param silent iff true => don't show messages
	 */
	static async pushRepository(
		repositoryPath: string,
		remote: string,
		branch: string,
		ahead: number = 0,
		silent: boolean = false,
	): Promise<any> {
		const status = Status.commitsPushing(repositoryPath, remote, branch, ahead)
		if (!silent) {
			GitRepository.updatingStart()
			StatusBar.addStatus(status)
		}
		await GitRepository.getSimplegit(repositoryPath)
			.push(remote, branch)
			.catch((error: any) => {
				Logger.showError(`Failed to Push changes to '${remote}/${branch}'`, true)
				Logger.showError(error, true)
				if (!silent) {
					StatusBar.removeStatus(status)
					GitRepository.updatingEnd(repositoryPath)
				}

				return
			})

		if (!silent) {
			StatusBar.addStatus(Status.commitsPushed(repositoryPath, remote, branch, ahead))
			StatusBar.removeStatus(status)
			GitRepository.updatingEnd(repositoryPath)
		}
	}

	/**
	 * pushes the changes from the root-Repository
	 */
	static async pushRootRepository(): Promise<any> {
		const gitModel = await GitRepository.getGitModel()

		return GitRepository.pushRepository(
			gitModel.getRelativePath(),
			gitModel.getRemote(),
			gitModel.getBranch(),
			gitModel.getAhead(),
		)
	}

	/*******************************************************************************************/
	/* MERGE */
	/*******************************************************************************************/

	/**
	 * pulls, merges and pushes changes to the Remote
	 * @param repositoryPath relative path of the Repsoitory
	 * @param remote name of the Remote
	 * @param branch name of the Branch
	 * @param ahead number of commits ahead
	 * @param behind number of commits behind
	 */
	static async pullAndPushRepository(
		repositoryPath: string,
		remote: string,
		branch: string,
		ahead: number = 0,
		behind: number = 0,
	): Promise<any> {
		GitRepository.updatingStart()
		const status = Status.commitsMerging(repositoryPath, remote, branch, ahead, behind)
		StatusBar.addStatus(status)

		await GitRepository.pullRepository(repositoryPath, remote, branch, behind, true).catch((error: any) =>
			GitRepository.catchPushAndPullRepositoryError(error, repositoryPath, remote, branch, status),
		)

		await GitRepository.pushRepository(repositoryPath, remote, branch, ahead, true).catch((error: any) =>
			GitRepository.catchPushAndPullRepositoryError(error, repositoryPath, remote, branch, status),
		)

		StatusBar.addStatus(Status.commitsMerged(repositoryPath, remote, branch, ahead, behind))
		StatusBar.removeStatus(status)
		GitRepository.updatingEnd(repositoryPath)
	}

	/**
	 * handles Errors that occure when merging changes
	 * @param error Error that occurred
	 * @param repositoryPath relative path of the Repsoitory
	 * @param remote name of the Remote
	 * @param branch name of the Branch
	 * @param status StatusItem
	 */
	private static catchPushAndPullRepositoryError(
		error: any,
		repositoryPath: string,
		remote: string,
		branch: string,
		status: StatusItem,
	): void {
		Logger.showError(`Failed to Merge changes on '${remote}/${branch}'`, true)
		Logger.showError(error, true)
		StatusBar.removeStatus(status)
		GitRepository.updatingEnd(repositoryPath)
	}

	/*******************************************************************************************/
	/* SUBMODULE UPDATE INIT */
	/*******************************************************************************************/

	/**
	 * updates and inits Submodules
	 */
	static async submoduleUpdateInit(): Promise<void> {
		await CMD.executeCommand('git submodule update --init').catch(() => {
			Logger.showError(`An Error occured while trying to update submodules`, true)

			return
		})
	}
}
