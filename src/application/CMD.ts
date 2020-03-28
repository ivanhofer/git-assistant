'use strict'

import { exec } from 'child_process'
import Logger from '../UI/Logger'
import { getWorkspacePath } from './Helper'

/**
 * this class allows to execute commands in the OS-shell
 */
export default class CMD {
	// filter to validate the input
	private static commandInjectionRegexp = new RegExp(/^[a-zA-Z 0-9\.\-\@]*$/)

	/**
	 * executes a given command in the shell
	 * @param command command to execute
	 * @param workspace path where the command should be executed
	 */
	static executeCommand(command: string, workspace: string = getWorkspacePath()): Promise<string> {
		// input is validated to prevent command-injection
		return new Promise((resolve, reject) => {
			if (!CMD.commandInjectionRegexp.test(command)) {
				Logger.showError(`Command '${command}' not allowed`, true)

				return reject()
			}
			// execute the passed command
			exec(command, { cwd: workspace }, (error: any, stdout: any, _stderr: any) => {
				if (error !== null) {
					return reject(error)
				}
				resolve(stdout.trim())
			})
		})
	}
}
