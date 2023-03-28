'use strict'

import Event from '../models/Event'
import EventHandler from '../handlers/EventHandler'
import Logger from '../UI/Logger'
import Status from '../UI/Status'
import StatusBar from '../UI/StatusBar'
import GitRepository from './GitRepository'
import { getWorkspacePath } from './Helper'
import Config from './Config'

const TIME_TO_WAIT_FOR_ALL_CHANGES = 1000

/**
 * this class handles changes in the curretnt Workspace-folder
 */
export default class Watcher {
	private static fsWatcher: any
	private static lastChange: Map<Event, number>
	private static changedFiles: Map<Event, Set<string>>
	private static excludePaths: string[]
	private static status = Status.watcherRunning()

	/**
	 * starts listening in the current Workspace-folder
	 */
	static async start(): Promise<void> {
		const chokidar = require('chokidar');
		Watcher.fsWatcher = chokidar.watch(getWorkspacePath(), (_event: string, filename: any) => {
			Watcher.handleFileChange(filename)
		})

		Watcher.lastChange = new Map()
		Watcher.changedFiles = new Map()
		Watcher.excludePaths = Config.getValue('watcher-excludePaths') || []

		StatusBar.addStatus(Watcher.status)
	}

	/**
	 * restarts the watcher
	 */
	static restart(): void {
		Watcher.stop()
		GitRepository.reset()
		StatusBar.addStatus(Status.watcherRestarted())
		Logger.showMessage('Watcher restarted')
		Watcher.start()
	}

	/**
	 * stops listening for file changes
	 */
	static stop(): void {
		if (Watcher.fsWatcher) {
			Watcher.fsWatcher.close()
		}
		StatusBar.removeStatus(Watcher.status)
	}

	/*******************************************************************************************/
	/* HANDLE FILE CHANGES */
	/*******************************************************************************************/

	/**
	 * handles what to do next when a file was changed
	 * @param filename file that was changed
	 */
	private static async handleFileChange(filename: string): Promise<void> {
		if (!filename) {
			return
		}
		// do nothing when the extension currently executes some Git-Commands
		if (GitRepository.isCurrentlyUpdating()) {
			return
		}

		// relpace Windows- with Unix-paths
		filename = filename.replace(/\\/gi, '/')

		let event
		if (filename.substring(0, 4) === '.git') {
			if (!(await GitRepository.isUnimportantGitFile(filename))) {
				// file in .git changed
				event = GitRepository.isChangeInSubmodule(filename) ? (event = Event.SUBMODULE) : (event = Event.GIT)
			}
		} else if (Watcher.isExcludedFile(filename)) {
			// something changed that was excluded
			return
		} else if ((await GitRepository.isFileInSubmodule(filename)).length) {
			// a file in a submodule has changed
			event = Event.FILE_SUBMODULE
		} else {
			// some otehr file has changed
			event = Event.FILE
		}
		if (event) {
			Watcher.fireChange(event, filename)
		}
	}

	/**
	 * waits for multiple changed files in a short period and calls the Event-Handler
	 * @param event Event the changed file belongs to
	 * @param filename name of the changed file
	 */
	private static async fireChange(event: Event, filename: string): Promise<void> {
		const changedFiles = await Watcher.waitForLastChange(event, filename)
		EventHandler.handle(event, changedFiles)
	}

	/**
	 * checks if the file is excluded to trigger a change
	 * @param filename filename to check
	 */
	private static isExcludedFile(filename: string): boolean {
		return Watcher.excludePaths.some((path: string) => new RegExp(path, 'gi').test(filename))
	}

	/**
	 * returns all changed files for a specific Event
	 * @param event Event to get changed files
	 */
	private static getChangedFiles(event: Event): Set<string> {
		const ret = Watcher.changedFiles.get(event)
		if (ret) {
			return ret
		}

		// nothing registered yet for this event => create new Set for it
		const set = new Set<string>()
		Watcher.changedFiles.set(event, set)

		return set
	}

	/**
	 * delays the return of the changed files for a specific Event
	 * @param event Event the changed file belongs to
	 * @param filename name of the changed file
	 */
	private static waitForLastChange(event: Event, filename: string): Promise<string[]> {
		const increased = Watcher.addChange(event, filename)

		return new Promise((resolve) => {
			setTimeout(() => {
				const lastUpdate = Watcher.getLastChange(event)
				// if the file of this call was the last changed file for this Event => return all changed files
				if (lastUpdate === increased) {
					let changedFiles: string[] = []
					changedFiles = [...Watcher.getChangedFiles(event)]
					Watcher.changedFiles.set(event, new Set())
					Logger.showMessage(`[changedFiles] ${event}: ${changedFiles.length} files changed`)

					resolve(changedFiles)
				}
			}, TIME_TO_WAIT_FOR_ALL_CHANGES)
		})
	}

	/**
	 * add a file to the changed files and update its lastChanged-counter
	 * @param event Event the changed file belongs to
	 * @param filename name of the changed file
	 */
	private static addChange(event: Event, filename: string): number {
		Watcher.getChangedFiles(event).add(filename)

		const incremented = Watcher.getLastChange(event) + 1
		Watcher.lastChange.set(event, incremented)

		return incremented
	}

	/**
	 * returns the number of the last iteration a file was changed for a specific Event
	 * @param event Event to get the last iteration from
	 */
	private static getLastChange(event: Event): number {
		const ret = Watcher.lastChange.get(event)

		return ret ? ret : 0
	}
}
