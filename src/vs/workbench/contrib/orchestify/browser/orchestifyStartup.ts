/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antigravity. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IOllamaService } from '../common/orchestify.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { localize } from '../../../../nls.js';

export class OrchestifyStartupContribution implements IWorkbenchContribution {
    constructor(
        @IOllamaService ollamaService: IOllamaService,
        @INotificationService notificationService: INotificationService
    ) {
        this.checkOllama(ollamaService, notificationService);
    }

    private async checkOllama(ollamaService: IOllamaService, notificationService: INotificationService) {
        // Check if Ollama/Docker is available on startup
        const isOllamaAvailable = await ollamaService.isAvailable();
        if (!isOllamaAvailable) {
            const isDockerPresent = await ollamaService.checkDocker();
            if (!isDockerPresent) {
                notificationService.prompt(
                    Severity.Info,
                    localize('dockerMissing', "Docker extension is missing. Would you like to install it for local LLM support?"),
                    [{
                        label: localize('install', "Install Docker Extension"),
                        run: () => ollamaService.installDockerExtension()
                    }]
                );
            }
        }
    }
}
