'use strict'

export default class Submodule {
	private commitHash: string
	private path: string
	private branch: string

	constructor(commitHash: string, path: string, branch: string) {
		this.commitHash = commitHash
		this.path = path
		this.branch = branch
	}

	getCommitHash(): string {
		return this.commitHash
	}

	getPath(): string {
		return this.path
	}

	getBranch(): string {
		return this.branch
	}
}
