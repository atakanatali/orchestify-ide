/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antigravity. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IViewPaneOptions, ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IOllamaService } from '../common/orchestify.js';
import * as DOM from '../../../../base/browser/dom.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { SelectBox, ISelectOptionItem } from '../../../../base/browser/ui/selectBox/selectBox.js';
import { defaultButtonStyles, defaultSelectBoxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { localize } from '../../../../nls.js';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';

export class LLMManagerView extends ViewPane {

    private container!: HTMLElement;
    private modelListContainer!: HTMLElement;
    private selectBox!: SelectBox;
    private selectionIndex: number = 0;

    private static readonly COMMON_MODELS: ISelectOptionItem[] = [
        { text: 'qwen2.5-coder:1.5b', detail: 'Lightweight (1.5B)' },
        { text: 'qwen2.5-coder:7b', detail: 'Powerful (7B)' },
        { text: 'llama3.1:8b', detail: 'General Purpose (8B)' },
        { text: 'deepseek-coder-v2:16b', detail: 'Advanced' },
        { text: 'mistral:latest', detail: 'Reliable' }
    ];

    constructor(
        options: IViewPaneOptions,
        @IInstantiationService instantiationService: IInstantiationService,
        @IViewDescriptorService viewDescriptorService: IViewDescriptorService,
        @IConfigurationService configurationService: IConfigurationService,
        @IContextKeyService contextKeyService: IContextKeyService,
        @IContextMenuService contextMenuService: IContextMenuService,
        @IKeybindingService keybindingService: IKeybindingService,
        @IOpenerService openerService: IOpenerService,
        @IThemeService themeService: IThemeService,
        @IHoverService hoverService: IHoverService,
        @IContextViewService private readonly contextViewService: IContextViewService,
        @IOllamaService private readonly ollamaService: IOllamaService
    ) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    }

    protected override renderBody(container: HTMLElement): void {
        super.renderBody(container);

        this.container = container;
        container.classList.add('llm-manager-view');

        // Input Section
        const inputSection = DOM.append(container, DOM.$('.input-section'));
        inputSection.style.padding = '10px';
        inputSection.style.display = 'flex';
        inputSection.style.flexDirection = 'column';
        inputSection.style.gap = '8px';

        const selectLabel = DOM.append(inputSection, DOM.$('div'));
        selectLabel.textContent = localize('selectModel', "Select a model to pull:");
        selectLabel.style.fontSize = '0.9em';
        selectLabel.style.opacity = '0.8';

        this.selectBox = this._register(new SelectBox(LLMManagerView.COMMON_MODELS, 0, this.contextViewService, defaultSelectBoxStyles));
        this.selectBox.render(inputSection);
        this._register(this.selectBox.onDidSelect(e => this.selectionIndex = e.index));

        const pullButton = this._register(new Button(inputSection, defaultButtonStyles));
        pullButton.label = localize('pull', "Pull Model");
        this._register(pullButton.onDidClick(() => this.pullModel()));

        // List Section
        this.modelListContainer = DOM.append(container, DOM.$('.model-list'));
        this.modelListContainer.style.padding = '10px';
        this.modelListContainer.style.overflowY = 'auto';

        // Docker Section
        this.renderDockerStatus(container);

        this.refresh();
    }

    private get contextViewProvider() {
        return {
            showContextView: (delegate: any) => this.contextMenuService.showContextMenu({
                getAnchor: () => this.container,
                getActions: () => [],
                ...delegate
            }),
            hideContextView: () => { },
            layout: () => { }
        };
    }

    private async pullModel() {
        const modelName = LLMManagerView.COMMON_MODELS[this.selectionIndex].text;
        if (!modelName) {
            return;
        }

        this.selectBox.setEnabled(false);
        try {
            await this.ollamaService.pullModel(modelName);
            await this.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            this.selectBox.setEnabled(true);
        }
    }

    private async deleteModel(modelName: string) {
        try {
            await this.ollamaService.deleteModel(modelName);
            await this.refresh();
        } catch (error) {
            console.error(error);
        }
    }

    private async refresh() {
        DOM.clearNode(this.modelListContainer);

        const isAvailable = await this.ollamaService.isAvailable();
        if (!isAvailable) {
            // warning.textContent = localize('ollamaUnavailable', "Ollama is not running. Please start Ollama.");
            // Silent as requested
            return;
        }

        const models = await this.ollamaService.listModels();

        if (models.length === 0) {
            const empty = DOM.append(this.modelListContainer, DOM.$('.empty'));
            empty.textContent = localize('noModels', "No models found.");
            return;
        }

        for (const model of models) {
            const containerItem = DOM.append(this.modelListContainer, DOM.$('.model-item'));
            containerItem.style.padding = '8px';
            containerItem.style.borderBottom = '1px solid var(--vscode-widget-border)'; // Changed from #333 to theme variable
            containerItem.style.display = 'flex';
            containerItem.style.justifyContent = 'space-between';
            containerItem.style.alignItems = 'center';

            const info = DOM.append(containerItem, DOM.$('.model-info'));
            const nameText = DOM.append(info, DOM.$('div'));
            nameText.textContent = model.name;
            nameText.style.fontWeight = 'bold';

            const detailsText = DOM.append(info, DOM.$('div'));
            detailsText.textContent = `${(model.size / 1024 / 1024 / 1024).toFixed(2)} GB • ${model.details?.parameter_size || 'N/A'}`;
            detailsText.style.fontSize = '0.8em';
            detailsText.style.opacity = '0.6';

            const actions = DOM.append(containerItem, DOM.$('.model-actions'));
            const deleteButton = this._register(new Button(actions, { ...defaultButtonStyles, secondary: true }));
            deleteButton.label = localize('delete', "Delete");
            this._register(deleteButton.onDidClick(() => this.deleteModel(model.name)));
        }
    }

    private renderDockerStatus(container: HTMLElement) {
        const dockerSection = DOM.append(container, DOM.$('.docker-section'));
        dockerSection.style.padding = '10px';
        dockerSection.style.marginTop = '10px';
        dockerSection.style.borderTop = '1px solid var(--vscode-widget-border)'; // Changed from #333 to theme variable

        const title = DOM.append(dockerSection, DOM.$('div'));
        title.textContent = localize('dockerStatus', "Docker Environments");
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '8px';

        const statusItem = DOM.append(dockerSection, DOM.$('div'));
        statusItem.style.display = 'flex';
        statusItem.style.alignItems = 'center';
        statusItem.style.gap = '8px';
        statusItem.style.fontSize = '0.9em';

        const dot = DOM.append(statusItem, DOM.$('div'));
        dot.style.width = '8px';
        dot.style.height = '8px';
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = '#4EC9B0'; // Green placeholder

        const statusText = DOM.append(statusItem, DOM.$('span')); // Added span for text
        statusText.textContent = localize('dockerRunning', "Ollama Container: Running");
        statusItem.prepend(dot);
    }

    private formatSize(bytes: number): string {
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(2)} GB`;
    }

    protected override layoutBody(height: number, width: number): void {
        super.layoutBody(height, width);
        this.container.style.height = `${height}px`;
        this.modelListContainer.style.height = `${height - 100}px`; // Adjusted for selectbox
    }
}
