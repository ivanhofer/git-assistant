# Git (Submodule) Assistant

> Not under active development! Feel free to contribute to the project if you like seeing it improve. I (the original maintainer) don't use submodules and this extension anymore.

'Git (Submodule) Assistant' is an extension for VS Code that helps you preventing common problems when handling with Git-repositories. Specially the use of Submodules in a project, when done wrong, can introduce some unintended problems. This extension detects these problems, notifies and assists you with fixes. The fixes can be also applied automatically as soon as the problem is detected.

[See extension in the VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=ivanhofer.git-assistant)

![image - 'Git (Submodule) Assistant'](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/git-assistant.png "image - 'Git (Submodule) Assistant'")

## Usage

Simply install this extension in VS Code and open a Git-repository\*. Then the extension will enable itself and assist you.

##### \* the ".git" Folder must be located in the root of the opened Workspace-Folder

## Features

The 'Git (Submodule) Assistant' runs as a background service and integrates in the VS Code taskbar. It offers a few features, that can detect common mistakes when handling with Git-repositories. You'll get a notification and the possibility to fix the problem with a simple click. Every feature can be disabled and configured in the VS Code settings. For many features it is possible to enable an auto-fix (see section SETTINGS): as soon as the problem is detected 'Git (Submodule) Assistant' will solve it for you.

'Git (Submodule) Assistant' helps you with the following things:

### It will warn you if you work on a branch where you should not commit (e.g. "master"-branch)

Whenever you are on a branch, you should not commit, 'Git (Submodule) Assistant' will display a warning. The names of the branches can be configured in the VS Code settings panel. You can interact with the notification and easily switch to another branch.

![image - branch warn](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/branch_warn.png 'image - branch warn')

### It will warn you if you close VS Code and not all commits were pushed to the remote

If you have changes that are not pushed to the remote and you try to close VS Code, 'Git (Submodule) Assistant' will prevent VS Code from closing and let you choose if you wish to push the changes or close VS Code. When you choose to push the changes, all commits will be pushed to the remote and VS Code will close itself. Unfurtunately, this will only work if you close VS Code by keyboard shortcut. If you close VS Code with your mouse by pressing the 'x'-button, the check fur unpushed commits will not perform.

![image - close IDE](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/close_ide.png 'image - close IDE')

### It will allow you to push every commit immediately to the remote

You'll get an Notification, that allows you to push your changes as soon as you commit them. You can configure the behaviour to let 'Git (Submodule) Assistant' push all your changes automatically as soon you commit something.

![image - push commits](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/push_commits.png 'image - push commits')

### It will check for new commits on the remote in a certain intervall and notify you if you'r not up-to-date

You can specify an intervall, where 'Git (Submodule) Assistant' will look for new changes on the remote. If changes were found you'll get a notification. It is also possible to let 'Git (Submodule) Assistant' download the commits automatically if there are no cahnges in the current workspace. The check for new commits will also be applied when you open VS Code.

![image - pull commits](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/pull_commits.png 'image - pull commits')

### It will check your Submodules, initialize and update them

Ever had the problem you had to update every submodule by hand? From now on 'Git (Submodule) Assistant' will handle that for you. It will check for new submodules, update all existing submodules in your repository and also checkout the correct branch for each of your submodules\*.

##### \* depending on how many submodules you have, it may take a few seconds until every submodule is up-to-date

![image - update submodules](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/update_submodules.png 'image - update submodules')

### It will detect an “detached HEAD” and allows to checkout the corresponding branch

'Git (Submodule) Assistant' will detect if the HEAD of your repository is detached. If that happens, you'll get a notification, that informs you about the status of your repository, to prevent you from unitended data loss. In the VS Code settings you can configure that 'Git (Submodule) Assistant' should checkout the correct branch for you as soon as detached HEAD is detected.

![image - detached head](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/detached_head.png 'image - push submodules first')

### It will also push your Submodules if the main-repository is pushed

To prevent that you forget to push your submodules, and nobody can clone the main repository anymore, 'Git (Submodule) Assistant' will push your submodules before it will push the commits from your main repositroy.

![image - push submodules first](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/push_submodules_first.png 'image - detached head')

### It will warn you if you don't have configured a remote in your repository

If you start a new Git project and forgot to add a remote, 'Git (Submodule) Assistant' will show a notification to inform you about the missing remote. This should prevent accidential data loss.

![image - publish branch](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/no_remote.png 'image - no remote')

### It will warn you if you forgot to publish a branch to the remote

If you create a new brnach and forgot to publish it, 'Git (Submodule) Assistant' will show a notification. If you want to publish the branch, just choose your desired remote. 'Git (Submodule) Assistant' can also publish every branch automatically, if you configure it in the settings. In the settings you can also specify a default remote where new branches are automatically published.

![image - check config variables](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/publish_branch.png 'image - publish branch')

### It will detect if some Git-configurations are missing and prompt you to fill them in

In case you forgot to configure essential Git settings, 'Git (Submodule) Assistant' will inform you and you can simply enter the value of the variable in VS Code. No command line is required. In the settings, you can choose variables 'Git (Submodule) Assistant' should look for in you Git config file.

![image - no remote](https://raw.githubusercontent.com/ivanhofer/git-assistant/main/images/docs/check_config_variables.png 'image - check config variables')

## Settings

If you get too many notifications or if you always click on "yes" to let 'Git (Submodule) Assistant' resolve the problem for you, there is an option for most features to save you some time: if a feature is set to "auto", it will not display a notification and handle the problem automatically for you.

It is possible to disable the extension in the Settings. This is useful if you only want the extension to assist you in some of your Git-repositories. You can configure project-specific features in your "workspace-settings".

A feature, if not needed, can be disabled in the settings panel.

## Feedback

Please share your thougts on the [GitHub page](https://github.com/ivanhofer/git-assistant) of the project.

## Dependencies

-  [deep-diff](https://github.com/flitbit/diff)
-  [simple-git](https://github.com/steveukx/git-js)
