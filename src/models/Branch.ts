'use strict'

export default class Branch {
	private name: string
	private commit: string

	constructor(name: string, commit: string) {
		this.name = name
		this.commit = commit
	}

	getName(): string {
		return this.name.replace(/remotes\//, '')
	}

	getCommit(): string {
		return this.commit
	}

	isRemote(): boolean {
		return this.name.match(/remotes\//) ? true : false
	}
}
