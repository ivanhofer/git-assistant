'use strict'

import { ExtensionContext } from 'vscode'
import Logger from '../UI/Logger'
import * as glob from 'glob'
import * as path from 'path'

const COMMANDS_PATH = path.join(__dirname, '../commands/')

/**
 * this class registers all commands displayed in the VS Code Command Pallette
 */
export default class Commands {
	/**
	 * search for all files matching the "*.command.js"-name-pattern and registers them as a Command in VS Code
	 * @param context VS Code ExtensionContext
	 */
	static registerCommands(context: ExtensionContext): Promise<void> {
		return new Promise(resolve => {
			// search all command-files
			glob('*.command.js', { cwd: COMMANDS_PATH }, (err: any, files: string[]) => {
				if (err) {
					console.error(err)

					return resolve()
				}

				// register each Command
				files.forEach((file: string) => {
					const command = require(COMMANDS_PATH + file)
					try {
						command.default.registerCommand(context)
					} catch (e) {
						Logger.showError(e)
					}
				})

				return resolve()
			})
		})
	}
}
