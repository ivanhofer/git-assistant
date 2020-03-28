/**
 * this class is the template for a ChangeHandler
 */
export default abstract class ChangeHandler {
	/**
	 * function that is called when the Handler should register itself
	 */
	static registerEventHandler(): void {
		throw new TypeError('Must override method')
	}

	/**
	 * function that is called when a Event was fired
	 * @param payload some additional information for the Handlers
	 */
	static async handle(_payload?: any): Promise<void> {
		throw new TypeError('Must override method')
	}
}
