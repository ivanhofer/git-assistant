'use strict'

import Logger from '../UI/Logger'
import * as glob from 'glob'
import * as path from 'path'

const HANDLERS_PATH = path.join(__dirname, '../handlers/')

/**
 * this class registers all feature-handler in the extension
 */
export default class Features {
	/**
	 * registers all files matching the "*.handler.js"-name-pattern to the Event-Handler
	 */
	static enableFeatures(): Promise<void> {
		return new Promise((resolve, reject) => {
			// search all feature-files
			glob('**/*.handler.js', { cwd: HANDLERS_PATH }, (err: any, files: string[]) => {
				if (err) {
					console.error(err)

					return resolve()
				}

				// register each Feature
				files.forEach((file: string) => {
					try {
						const Handler = require(HANDLERS_PATH + file)
						Handler.default.registerEventHandler()
					} catch (e) {
						Logger.showError(e)
					}
				})

				return resolve()
			})
		})
	}
}
