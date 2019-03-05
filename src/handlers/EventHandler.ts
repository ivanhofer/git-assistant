'use strict'

import Logger from '../UI/Logger'
import Event from '../models/Event'
import ChangeHandler from './ChangeHandler'

/**
 * this class handles the registration and calling of Features of the Extension
 */
export default class EventHandler {
	private static changeHandlers: Map<Event, any[]> = new Map()
	private static level = 0

	/**
	 * gets all registered Handlers for a given Event
	 * @param changeEvent Event to search for
	 */
	private static getChangeHandlers(changeEvent: Event): typeof ChangeHandler[] {
		if (!EventHandler.changeHandlers.has(changeEvent)) {
			EventHandler.changeHandlers.set(changeEvent, [])
		}
		const ret = EventHandler.changeHandlers.get(changeEvent)
		if (ret) {
			return ret
		}

		return []
	}

	/**
	 * resets everything and deletes all Handlers
	 */
	static clearAllHandlers(): void {
		EventHandler.changeHandlers = new Map()
		EventHandler.level = 0
		Logger.showMessage(`[event] ChangeHandlers reset`)
	}

	/**
	 * registers an Handler for a specific Event
	 * @param changeEvent Event, when the Handler should be called
	 * @param Handler Handler that is called when the Event was fired
	 */
	static registerHandler(changeEvent: Event, Handler: typeof ChangeHandler): void {
		const Handlers = EventHandler.getChangeHandlers(changeEvent)
		Handlers.push(Handler)
		Logger.showMessage(`[event][register] '${Handler.name}' added to ${changeEvent}-Handlers`)
	}

	/**
	 * calls all Handlers for a specific Event
	 * @param changeEvent Event to fire
	 * @param payload some additional information for the Handlers
	 */
	static async handle(changeEvent: Event, payload?: any): Promise<void> {
		const Handlers = EventHandler.getChangeHandlers(changeEvent)
		if (!Handlers.length) {
			return
		}

		EventHandler.level++

		const levelStringUp = EventHandler.levelString(true)
		const levelStringDown = EventHandler.levelString(false)

		const timeStartHandler = Date.now()
		for (const Handler of Handlers) {
			const timeStartEvent = Date.now()
			Logger.showMessage(`[event][call]${levelStringUp} '${Handler.name}'`)
			// call Handler and wait until its finished
			await Handler.handle(payload)
			const timeEndEvent = Date.now()
			const timeDiffEvent = (timeEndEvent - timeStartEvent) / 1000
			Logger.showMessage(`[event][call]${levelStringDown} '${Handler.name}' [${timeDiffEvent}s]`)
		}
		const timeEndHandler = Date.now()
		const timeDiffHandler = (timeEndHandler - timeStartHandler) / 1000
		Logger.showMessage(
			`[event] ${Handlers.length} function${Handlers.length === 1 ? '' : 's'} called for '${changeEvent}' [${timeDiffHandler}s]`
		)

		EventHandler.level--
	}

	/**
	 * generates the depth-info of the current called function
	 * @param up wheter the Event was started or ended
	 */
	private static levelString(up: boolean): string {
		return `${new Array(EventHandler.level - 1).fill(' -').join('')} ${up ? '>' : '<'}`
	}
}
