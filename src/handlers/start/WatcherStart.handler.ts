'use strict'

import Watcher from '../../application/Watcher'
import ChangeHandler from '../ChangeHandler'
import Event from '../../models/Event'
import EventHandler from '../EventHandler'

/**
 * this Handler starts the Watcher on Extension-start
 */
export default class WatcherStart extends ChangeHandler {
	static registerEventHandler(): void {
		EventHandler.registerHandler(Event.START, this)
	}

	static async handle(): Promise<void> {
		return Watcher.start()
	}
}
