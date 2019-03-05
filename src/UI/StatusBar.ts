'use strict'

import { ExtensionContext, StatusBarAlignment, StatusBarItem, window } from 'vscode'
import Logger from './Logger'
import StatusItem from './StatusItem'

export const DEFAULT_TIMEOUT: number = 3000
export const TICK_TIME: number = 500
const ANIMATION_TIMEOUT: number = 250
const NR_OF_ANIMATION_DOTS: number = 5

/**
 * this class handles the information displayed in the StatusBar
 */
export default class StatusBar {
	static statusbarItem: StatusBarItem
	static status: StatusItem[]
	static tickCount: number
	static iteration: number = 0

	/**
	 * initializes the StatusBar
	 * @param context VS Code ExtensionContext
	 */
	static initStatusBar(context: ExtensionContext): void {
		StatusBar.statusbarItem = window.createStatusBarItem(StatusBarAlignment.Left, 0)
		StatusBar.statusbarItem.command = 'git-assistant.showOutput'
		context.subscriptions.push(StatusBar.statusbarItem)
		StatusBar.status = []
		StatusBar.tickCount = 0
	}

	/**
	 * adds a status to the queue
	 * @param status status to add
	 */
	static addStatus(status: StatusItem): void {
		Logger.showMessage('[status] ' + status.toStringText())
		StatusBar.status.push(status)
		StatusBar.showLatestStatus()
	}

	/**
	 * removes a status from the queue
	 * @param status status to remove
	 */
	static removeStatus(status: StatusItem): void {
		StatusBar.status = StatusBar.status.filter(stat => stat !== status)
		StatusBar.showLatestStatus()
	}

	/**
	 * animates a status over time
	 * @param status status to animate
	 */
	static animateStatus(status: StatusItem): void {
		if (!StatusBar.status.length || StatusBar.getPriorityStatusItem() !== status) {
			return
		}

		let text = `${status.toStringIcon()} `
		text += new Array(StatusBar.iteration).fill('.').join('')
		text += status.toStringText()
		text += new Array(NR_OF_ANIMATION_DOTS - StatusBar.iteration).fill('.').join('')

		StatusBar.statusbarItem.text = text

		if (++StatusBar.iteration > NR_OF_ANIMATION_DOTS) {
			StatusBar.iteration = 0
		}

		setTimeout(() => {
			StatusBar.animateStatus(status)
		}, ANIMATION_TIMEOUT)
	}

	/**
	 * displays the status with the highest priority
	 */
	private static showLatestStatus(): void {
		const length = StatusBar.status.length
		if (!length) {
			StatusBar.statusbarItem.hide()

			return
		}

		let status = StatusBar.status[length - 1]

		const temp = StatusBar.getPriorityStatusItem()
		if (temp) {
			status = temp
		}

		StatusBar.statusbarItem.text = status.toString()
		StatusBar.statusbarItem.show()
		if (status.isAnimated()) {
			StatusBar.animateStatus(status)
		}
		if (status.isTemporary()) {
			StatusBar.nextTick(status, ++StatusBar.tickCount)
		}
	}

	/**
	 * returns a StatusItem with priority if it exists in the queue
	 */
	private static getPriorityStatusItem(): StatusItem | undefined {
		const animated = StatusBar.status.filter((statusItem: StatusItem) => statusItem.isAnimated())
		if (animated.length) {
			return animated.reverse()[0]
		}
		const temporary = StatusBar.status.filter((statusItem: StatusItem) => statusItem.isTemporary())
		if (temporary.length) {
			return temporary[0]
		}

		return undefined
	}

	/**
	 * displays a status for a temporary time
	 * @param status status to display
	 * @param tickCount incrementing tick count
	 */
	private static nextTick(status: StatusItem, tickCount: number): void {
		if (StatusBar.tickCount !== tickCount || StatusBar.getPriorityStatusItem() !== status) {
			return
		}
		const finished = status.reduceDisplayTime()

		if (!finished) {
			setTimeout(() => {
				StatusBar.nextTick(status, tickCount)
			}, TICK_TIME)

			return
		}
		StatusBar.removeStatus(status)
	}
}
