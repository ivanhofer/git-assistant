enum Event {
	EXIT = 'EXIT',
	FILE = 'FILE',
	FILE_SUBMODULE = 'FILE_SUBMODULE',
	GIT = 'GIT',
	GIT_BRANCH_CHANGED = 'GIT_BRANCH_CHANGED',
	GIT_COMMITS = 'GIT_COMMITS',
	GIT_COMMITS_LOCAL = 'GIT_COMMITS_LOCAL',
	GIT_COMMITS_REMOTE = 'GIT_COMMITS_REMOTE',
	GIT_PUSH = 'GIT_PUSH',
	START = 'START',
	SUBMODULE = 'SUBMODULE',
	SUBMODULE_UPDATE = 'SUBMODULE_UPDATE'
}

export default Event