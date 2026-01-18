/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Antigravity. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

export const IOllamaService = createDecorator<IOllamaService>('ollamaService');

export interface IOllamaModel {
    name: string;
    size: number;
    digest: string;
    modified_at: string;
    details: {
        format: string;
        family: string;
        families: string[];
        parameter_size: string;
        quantization_level: string;
    };
}

export interface IOllamaService {
    readonly _serviceBrand: undefined;

    isAvailable(): Promise<boolean>;
    listModels(): Promise<IOllamaModel[]>;
    pullModel(model: string): Promise<void>;
    deleteModel(model: string): Promise<void>;
    generate(model: string, prompt: string): Promise<string>;
    checkDocker(): Promise<boolean>;
    installDockerExtension(): Promise<void>;
}
