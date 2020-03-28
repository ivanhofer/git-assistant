'use strict'
import { WorkspaceConfiguration, ConfigurationTarget, workspace } from 'vscode'

export enum ConfigOptions {
	'enabled' = 'enabled',
	'auto' = 'auto',
	'disabled' = 'disabled',
}

/**
 * this class is responsible for reading the Configuration-Settings of the Extension
 */
export default class Config {
	private static config: WorkspaceConfiguration

	/**
	 * loads the current config of the extension
	 */
	static loadConfig() {
		this.config = workspace.getConfiguration('git-assistant')
	}

	/**
	 * gets the value of a specific config-key
	 * @param value config-key
	 */
	static getValue(value: string): any {
		return Config.config.get(value)
	}

	/**
	 * checks if a feature is enabled
	 * @param value config-key
	 */
	static isEnabled(value: string): boolean {
		const val = Config.getValue(value)
		if (!val || val === ConfigOptions.disabled) {
			return false
		}

		return true
	}

	/**
	 * disables a feature in the global-configs
	 * @param value config-key
	 */
	static disable(value: string) {
		Config.config.update(value, 'disabled', ConfigurationTarget.Global)
	}
}
