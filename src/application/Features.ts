'use strict'

import PushBeforeClosingIDE from '../handlers/exit/PushBeforeClosingIDE.handler'
import GitHandler from '../handlers/git/GitHandler.handler'
import BranchWarn from '../handlers/git/branch_changed/BranchWarn.handler'
import CheckForRemote from '../handlers/git/branch_changed/CheckForRemote.handler'
import DetectDetachedHead from '../handlers/git/branch_changed/DetectDetachedHead.handler'
import MergeCommits from '../handlers/git/commits/MergeCommits.handler'
import PullCommits from '../handlers/git/commits/PullCommits.handler'
import PushCommits from '../handlers/git/commits/PushCommit.handler'
import PushSubmodulesFirst from '../handlers/git/push/PushSubmodulesFirst.handler'
import CheckConfigVariables from '../handlers/start/CheckConfigVariables.handler'
import CheckRemoteChanges from '../handlers/start/CheckRemoteChanges.handler'
import PerformStartupCheckOfRepositories from '../handlers/start/PerformStartupCheckOfRepositories.handler'
import UpdateInitSubmodules from '../handlers/start/UpdateInitSubmodules.handler'
import WatcherStart from '../handlers/start/WatcherStart.handler'
import HandleSubmoduleUpdate from '../handlers/submodule/update/HandleSubmoduleUpdate.handler'
import SubmoduleHandler from '../handlers/submodule/SubmoduleHandler.handler'

const HANDLERS = [
	PushBeforeClosingIDE,
	GitHandler,
	BranchWarn,
	CheckForRemote,
	DetectDetachedHead,
	MergeCommits,
	PullCommits,
	PushCommits,
	PushSubmodulesFirst,
	CheckConfigVariables,
	CheckRemoteChanges,
	PerformStartupCheckOfRepositories,
	UpdateInitSubmodules,
	WatcherStart,
	SubmoduleHandler,
	HandleSubmoduleUpdate
]
/**
 * this class registers all feature-handler in the extension
 */
export default class Features {
	/**
	 * registers all files matching the "*.handler.js"-name-pattern to the Event-Handler
	 */
	static enableFeatures(): void {
		HANDLERS.forEach(handler => {
			handler.registerEventHandler()
		})
	}
}
