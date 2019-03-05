'use strict'

import { DEFAULT_TIMEOUT, TICK_TIME } from './StatusBar'

export enum Octicon {
	'comment' = '$(comment)',
	'sync' = '$(sync)',
	'code' = '$(code)'
}

/**
 * this class is a wrapper for a message displayed in the StatusBar
 */
export default class StatusItem {
	private text: string
	private icon: Octicon
	private animated: boolean
	private temporary: boolean
	private displayTime: number

	constructor(text: string = '', icon: Octicon = Octicon.comment, animated: boolean = false, displayTime: number = 0) {
		this.icon = icon
		this.text = text
		this.animated = animated
		this.temporary = displayTime > 0
		this.displayTime = displayTime
	}

	static newTemporaryStatusItem(text: string): StatusItem {
		return new StatusItem(text, Octicon.comment, false, DEFAULT_TIMEOUT)
	}

	static newAnimatedStatusItem(text: string): StatusItem {
		return new StatusItem(text, Octicon.sync, true)
	}

	isAnimated(): boolean {
		return this.animated
	}

	isTemporary(): boolean {
		return this.temporary
	}

	reduceDisplayTime(): boolean {
		this.displayTime -= TICK_TIME

		return this.displayTime < 0
	}

	toString(): string {
		return `${this.toStringIcon()} ${this.toStringText()}`
	}

	toStringIcon(): string {
		return `${this.icon}`
	}

	toStringText(): string {
		return this.text
	}
}
