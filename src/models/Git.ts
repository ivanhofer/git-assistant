'use strict'

import { isAbsolute, join } from 'path'
import Branch from './Branch'
import Submodule from './Submodule'
import { getWorkspacePath } from '../application/Helper'

export default class Git {
	private dirpath: string
	private timestamp: number
	private branch: string
	private remote: string
	private detachedHEAD: boolean
	private branches: Branch[]
	private remotes: string[]
	private ahead: number
	private behind: number
	private submodules: Submodule[]
	private mainRepositoryPath: string
	private oldModel: Git | null

	constructor(dirpath: string = '') {
		dirpath = dirpath.replace(/\\/gi, '/')
		this.dirpath = join(getWorkspacePath(), dirpath)
		this.timestamp = Date.now()
		this.branch = ''
		this.remote = ''
		this.detachedHEAD = false
		this.branches = []
		this.remotes = []
		this.ahead = 0
		this.behind = 0
		this.submodules = []
		this.mainRepositoryPath = ''
		this.oldModel = null
	}

	getPath(): string {
		return this.dirpath
	}

	getRelativePath(): string {
		const relativePath = this.dirpath.replace(getWorkspacePath(), '').replace(/\\/gi, '/')
		if (isAbsolute(relativePath)) {
			return relativePath.substr(1)
		}

		return relativePath
	}

	isRootGit(): boolean {
		return this.dirpath === getWorkspacePath()
	}

	getTimestamp(): number {
		return this.timestamp
	}

	getBranch(): string {
		return this.branch
	}

	setBranch(branch: string): void {
		this.branch = branch
	}

	getRemote(): string {
		return this.remote
	}

	setRemote(remote: string): void {
		this.remote = remote
	}

	isHeadDetached(): boolean {
		return this.detachedHEAD
	}

	setDetachedHEAD(detachedHEAD: boolean): void {
		this.detachedHEAD = detachedHEAD
	}

	setBranches(branches: any): void {
		this.branches = Object.keys(branches)
			.map(key => branches[key])
			.map((branch: any) => new Branch(branch.name, branch.commit))
	}

	getBranches(): Branch[] {
		return this.branches
	}

	getLocalBranches(): Branch[] {
		return this.branches.filter((branch: Branch) => !branch.isRemote())
	}

	getRemoteBranches(): Branch[] {
		return this.branches.filter((branch: Branch) => branch.isRemote())
	}

	setRemotes(remotes: any): void {
		this.remotes = remotes.map((remote: any) => remote.name)
	}

	getRemotes(): string[] {
		return this.remotes
	}

	getAhead(): number {
		return this.ahead
	}

	setAhead(ahead: number): void {
		this.ahead = ahead
	}

	getBehind(): number {
		return this.behind
	}

	setBehind(behind: number): void {
		this.behind = behind
	}

	setSubmodules(CMDoutput: string): void {
		this.submodules = []
		if (!CMDoutput.length) {
			return
		}
		const split = CMDoutput.split(' ')
		for (let i = 0; i < split.length; ) {
			if (!split[i].length) {
				i++
			}
			const hash = split[i]
			const path = split[i + 1]
			let branch = split[i + 2] || ''

			if (branch.indexOf('(') < 0) {
				branch = ''
				i--
			}
			i += 3
			this.submodules.push(new Submodule(hash, path, branch))
		}
	}

	getSubmodules(): Submodule[] {
		return this.submodules
	}

	setMainRepositoryPath(mainRepositoryPath: string): void {
		this.mainRepositoryPath = mainRepositoryPath
	}

	getMainRepositoryPath(): string {
		return this.mainRepositoryPath
	}

	setOldModel(oldModel: Git): void {
		this.oldModel = oldModel
	}

	getOldModel(): Git | null {
		return this.oldModel
	}
}
