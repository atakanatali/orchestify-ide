/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antigravity. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { OrchestifyStartupContribution } from './orchestifyStartup.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions, IWorkbenchContributionsRegistry } from '../../../common/contributions.js';
import { LifecyclePhase } from '../../../services/lifecycle/common/lifecycle.js';
import { localize2, localize } from '../../../../nls.js';

Registry.as<IWorkbenchContributionsRegistry>(WorkbenchExtensions.Workbench).registerWorkbenchContribution(OrchestifyStartupContribution, LifecyclePhase.Restored);

import { Extensions as ViewExtensions, IViewsRegistry, IViewDescriptor, IViewContainersRegistry, ViewContainerLocation } from '../../../common/views.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { LLMManagerView } from './llmManagerView.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ViewPaneContainer } from '../../../browser/parts/views/viewPaneContainer.js';
import './ollamaService.js'; // Registers the service

// Register View Container
const VIEW_CONTAINER_ID = 'workbench.view.vscode';
const VIEW_CONTAINER = Registry.as<IViewContainersRegistry>(ViewExtensions.ViewContainersRegistry).registerViewContainer({
    id: VIEW_CONTAINER_ID,
    title: localize2('vscode', 'Orchestify'),
    icon: Codicon.hubot,
    order: 10,
    hideIfEmpty: false,
    ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }])
}, ViewContainerLocation.Sidebar);

// Register Views
const LLM_VIEW_ID = 'workbench.view.vscode.llmManager';

Registry.as<IViewsRegistry>(ViewExtensions.ViewsRegistry).registerViews([{
    id: LLM_VIEW_ID,
    name: localize2('llmManager', 'LLM Manager'),
    containerIcon: Codicon.hubot,
    canToggleVisibility: true,
    canMoveView: true,
    order: 2,
    ctorDescriptor: new SyncDescriptor(LLMManagerView),
} as IViewDescriptor], VIEW_CONTAINER);

import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IViewDescriptorService } from '../../../common/views.js';

// Action to focus the view
registerAction2(class FocusOrchestifyViewAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.vscode.focus',
            title: localize2('focusOrchestify', "Focus Orchestify"),
            category: Categories.View,
            f1: true
        });
    }

    run(accessor: ServicesAccessor): void {
        const viewDescriptorService = accessor.get(IViewDescriptorService);
        const viewContainer = viewDescriptorService.getViewContainerById(VIEW_CONTAINER_ID);
        if (viewContainer) {
            const model = viewDescriptorService.getViewContainerModel(viewContainer);
            if (model.activeViewDescriptors.length > 0) {
                // Focus the first view
                // In a real implementation we might want to focus the specific view
            }
        }
    }
});

import { IConfigurationRegistry, Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';

Registry.as<IConfigurationRegistry>(ConfigurationExtensions.Configuration).registerConfiguration({
    id: 'vscode',
    title: localize('vscode', 'Orchestify'),
    type: 'object',
    properties: {
        'vscode.llm.model': {
            type: 'string',
            default: 'qwen2.5-coder:1.5b',
            description: localize('vscodeModel', "The default LLM model to use for Orchestify features."),
        }
    }
});
