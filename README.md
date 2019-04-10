# Git (Submodule) Assistant

Git Assistant is an extension that helps you preventing common problems when handling with Git-repositories. Specially the use of Submodules in a project, when done wrong, can introduce some unintended problems. This Extension detect these problems, notifies and assists you with fixes. The Fixes can be also applied automatically as soon as the problem is detected.

![image - git assistant](https://github.com/ivanhofer/git-assistant/raw/master/images/docs/git-assistant.png 'image - git assistant')

## Usage

Simply install this extension in VS Code and open a Git-repository\*. Then the extension will enable itself and assist you.

##### \* the ".git" Folder must be located in the root of the opened Workspace-Folder

## Features

The Git Assistant runs as a background service and integrates in the VS Code taskbar. It offers a few features, that can detect common mistakes when handling with Git-repositories. You'll get a notification and the possibility to fix the problem with a simple click. Every feature can be disabled and configured in the VS Code settings. For many features it is possible to enable an auto-fix (see section SETTINGS): as soon as the problem is detected Git Assistant will solve it for you.

Git Assistant helps you with following things:

### It will warn you if you work on a branch where you should not commit (e.g. "master"-branch)

Whenever you are on a branch, you should not commit, git-assistant will display a warning. The names of the branches can be configured in the VS Code settings panel. You can interact with the notification and easily switch to another branch.

![image - branch warn](https://github.com/ivanhofer/git-assistant/raw/master/images/docs/branch_warn.png 'image - branch warn')

### It will warn you if you close VS Code and not all commits were pushed to the remote

If you have changes that are not pushed to the remote and you try to close VS Code, git-assistant will prevent VS Code from closing and let you choose if you wish to push the changes or close VS Code. When you choose to push the changes, all commits will be pushed to the remote and VS Code will close itself. Unfurtunately, this will only work if you close VS Code by keyboard shortcut. If you close VS Code with your mouse by presdsing the 'x'-button, the check fur unpushed commits will not perform.

![image - close IDE](https://github.com/ivanhofer/git-assistant/raw/master/images/docs/close_ide.png 'image - close IDE')

### It will allow you to push every commit immediately to the remote

You'll get an Notification, that allows you to push your changes as soon as you commit them. You can configure the behaviour to let git-assistant push all your changes automatically as soon you commit something.

![image - push commits](https://github.com/ivanhofer/git-assistant/raw/master/images/docs/push_commits.png 'image - push commits')

### It will check for new commits on the remote in a certain intervall and notify you if you'r not up-to-date

[description coming soon]

### It will warn you if you don't have configured a remote in your repository

[description coming soon]

### It will warn you if you forgot to publish a branch to the remote

[description coming soon]

### It will detect if some Git-configurations are missing and promt you to fill them in

[description coming soon]

### It will check your Submodules, initialize and update them

[description coming soon]

### It will detect an “detached HEAD” and allows to checkout the corresponding branch

[description coming soon]

### It will also push your Submodules if the main-repository is pushed

[description coming soon]

## Settings

If you get too many notifications or if you always click on "yes" to let Git Assistant resolve the problem for you, there is an option for most features to save you some time: if a feature is set to "auto", it will not display a notification and handle the problem automatically for you.

It is possible to disable the extension in the Settings. This is useful if you only want the extension to assist you in some of your Git-repositories. You can configure project-specific features in your "workspace-settings".

A feature, if not needed, can be disabled in the settings panel.

## Feedback

Please share your thougts on the [GitHub page](https://github.com/ivanhofer/git-assistant) of the project.
