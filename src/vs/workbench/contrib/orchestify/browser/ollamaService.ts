/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antigravity. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IOllamaService, IOllamaModel } from '../common/orchestify.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';

export class OllamaService implements IOllamaService {

    declare readonly _serviceBrand: undefined;

    private readonly baseUrl = 'http://localhost:11434';

    constructor(
        @IExtensionService private readonly extensionService: IExtensionService,
        @ICommandService private readonly commandService: ICommandService
    ) { }

    async isAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async listModels(): Promise<IOllamaModel[]> {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) {
                return [];
            }
            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Failed to list Ollama models:', error);
            return [];
        }
    }

    async pullModel(model: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/pull`, {
            method: 'POST',
            body: JSON.stringify({ name: model }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to pull model: ${response.statusText}`);
        }

        // Stream usage would be better, but for now simple await
        // Note: Pulling is a long operation, ideally we should handle streaming response
    }

    async deleteModel(model: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/api/delete`, {
            method: 'DELETE',
            body: JSON.stringify({ name: model }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete model: ${response.statusText}`);
        }
    }

    async generate(model: string, prompt: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            body: JSON.stringify({ model, prompt, stream: false }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Failed to generate: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    }

    async checkDocker(): Promise<boolean> {
        const dockerExtensionId = 'ms-azuretools.vscode-docker';
        const extension = await this.extensionService.getExtension(dockerExtensionId);
        return !!extension;
    }

    async installDockerExtension(): Promise<void> {
        const dockerExtensionId = 'ms-azuretools.vscode-docker';
        try {
            await this.commandService.executeCommand('workbench.extensions.installExtension', dockerExtensionId);
        } catch (error) {
            console.error('Failed to install Docker extension:', error);
        }
    }
}

registerSingleton(IOllamaService, OllamaService, InstantiationType.Delayed);
