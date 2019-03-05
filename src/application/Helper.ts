'use strict'

import { workspace } from 'vscode'

/**
 * returns the path opf the current opened Workspace
 */
export const getWorkspacePath = (): string => {
	if (!workspace.workspaceFolders) {
		return ''
	}

	return workspace.workspaceFolders[0].uri.fsPath
}

/**
 * returns the name of the repository folder
 * @param repositoryPath relative path of the repository
 */
export const getRepositoryName = (repositoryPath: string): string => {
	let name = repositoryPath
	// if the root-folder is passed, find and return its name
	if (!name.length) {
		if (workspace.workspaceFolders) {
			name = workspace.workspaceFolders[0].name
		}
	}

	return name
}

/**
 * creates a diff of two objects
 * @param target target-object
 * @param source source-object
 */
export const deepmerge = (target: any, source: any) => {
	// Iterate through `source` properties and if an `Object` set property to merge of `target` and `source` properties
	for (const key of Object.keys(source)) {
		if (source[key] instanceof Object && key in target) {
			Object.assign(source[key], deepmerge(target[key], source[key]))
		}
	}
	// Join `target` and modified `source`
	Object.assign(target || {}, source)

	return target
}
