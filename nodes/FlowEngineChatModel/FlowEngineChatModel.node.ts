import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class FlowEngineChatModel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'FlowEngine Chat Model',
		name: 'flowEngineChatModel',
		icon: 'file:flowengine.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["model"]}}',
		description: 'Access 100+ AI models (OpenAI, Anthropic, Google, Mistral, etc.) via FlowEngine',
		defaults: {
			name: 'FlowEngine Chat Model',
		},
		usableAsTool: true,
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://flowengine.cloud/api-docs',
					},
				],
			},
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'flowEngineChatModelApi',
				required: true,
			},
		],
		properties: [
			{
				displayName:
					'For API key, go to <a href="https://flowengine.cloud/settings" target="_blank">flowengine.cloud/settings</a>',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Provider Name or ID',
				name: 'provider',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getProviders',
				},
				default: '',
				description:
					'Filter models by provider. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Model Name or ID',
				name: 'model',
				type: 'options',
				typeOptions: {
					loadOptionsDependsOn: ['provider'],
					loadOptionsMethod: 'getModels',
				},
				default: '',
				required: true,
				description:
					'The AI model to use. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'The message/prompt to send to the AI model',
			},
			{
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to configure the request',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						default: 0.7,
						typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
						description:
							'Controls randomness: lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
						type: 'number',
					},
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						default: -1,
						description:
							'The maximum number of tokens to generate in the completion. Set to -1 for no limit.',
						type: 'number',
						typeOptions: {
							maxValue: 32768,
						},
					},
					{
						displayName: 'System Message',
						name: 'systemMessage',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Optional system message to set the behavior of the assistant',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getProviders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('flowEngineChatModelApi');
				const apiKey = credentials?.apiKey as string;

				if (!apiKey) {
					return [
						{
							name: 'API Key Required',
							value: '',
							description:
								'Set up FlowEngine Chat Model API credentials to load providers',
						},
					];
				}

				const url = 'https://flowengine.cloud/api/v1/litellm/models';

				try {
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url,
						headers: { Authorization: `Bearer ${apiKey}` },
					});

					if (response.data && Array.isArray(response.data)) {
						const providers = new Set<string>();
						response.data.forEach(
							(model: { model_info?: { provider?: string; litellm_provider?: string } }) => {
								const provider = model.model_info?.provider || model.model_info?.litellm_provider;
								if (provider) {
									providers.add(provider);
								}
							},
						);

						const providerOptions = Array.from(providers)
							.sort()
							.map((provider) => ({
								name: provider.charAt(0).toUpperCase() + provider.slice(1),
								value: provider,
							}));

						return [{ name: 'All Providers', value: 'all' }, ...providerOptions];
					}
				} catch {
					// Error fetching providers
				}

				return [{ name: 'All Providers', value: 'all' }];
			},

			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('flowEngineChatModelApi');
				const apiKey = credentials?.apiKey as string;

				if (!apiKey) {
					return [
						{
							name: 'API Key Required',
							value: '',
							description:
								'Set up FlowEngine Chat Model API credentials to load models',
						},
					];
				}

				const provider = this.getCurrentNodeParameter('provider') as string;
				const url = 'https://flowengine.cloud/api/v1/litellm/models';

				try {
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url,
						headers: { Authorization: `Bearer ${apiKey}` },
					});

					if (response.data && Array.isArray(response.data)) {
						let models = response.data;
						if (provider && provider !== 'all') {
							models = models.filter(
								(model: { model_info?: { provider?: string; litellm_provider?: string } }) => {
									const modelProvider =
										model.model_info?.provider || model.model_info?.litellm_provider;
									return modelProvider === provider;
								},
							);
						}

						return models
							.filter((model: { model_name?: string }) => model.model_name)
							.map(
								(model: {
									model_name?: string;
									model_info?: { provider?: string; litellm_provider?: string };
								}) => {
									const modelProvider =
										model.model_info?.provider || model.model_info?.litellm_provider;
									return {
										name: model.model_name || '',
										value: model.model_name || '',
										description: modelProvider ? `Provider: ${modelProvider}` : undefined,
									};
								},
							)
							.sort((a: INodePropertyOptions, b: INodePropertyOptions) =>
								(a.name as string).localeCompare(b.name as string),
							);
					}
				} catch {
					// Error fetching models
				}

				return [
					{
						name: 'Error Loading Models',
						value: '',
						description: 'Failed to fetch available models from FlowEngine',
					},
				];
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const model = this.getNodeParameter('model', i) as string;
				const message = this.getNodeParameter('message', i) as string;
				const options = this.getNodeParameter('options', i, {}) as {
					temperature?: number;
					maxTokens?: number;
					systemMessage?: string;
				};

				const credentials = await this.getCredentials('flowEngineChatModelApi');
				const apiKey = credentials?.apiKey as string;

				if (!apiKey) {
					throw new NodeOperationError(
						this.getNode(),
						'FlowEngine Chat Model API key is required. Get your API key from flowengine.cloud/settings.',
						{ itemIndex: i },
					);
				}

				const baseUrl = 'https://flowengine.cloud/api/v1/litellm';

				const messages: Array<{ role: string; content: string }> = [];

				if (options.systemMessage) {
					messages.push({ role: 'system', content: options.systemMessage });
				}

				messages.push({ role: 'user', content: message });

				const body: {
					model: string;
					messages: Array<{ role: string; content: string }>;
					temperature?: number;
					max_tokens?: number;
				} = {
					model,
					messages,
				};

				if (options.temperature !== undefined) {
					body.temperature = options.temperature;
				}

				if (options.maxTokens !== undefined && options.maxTokens !== -1) {
					body.max_tokens = options.maxTokens;
				}

				const response = await this.helpers.httpRequest({
					method: 'POST',
					url: `${baseUrl}/v1/chat/completions`,
					headers: {
						Authorization: `Bearer ${apiKey}`,
						'Content-Type': 'application/json',
					},
					body,
				});

				if (response.choices && response.choices.length > 0) {
					returnData.push({
						json: {
							success: true,
							response: response.choices[0].message.content,
							model,
							usage: response.usage,
							finishReason: response.choices[0].finish_reason,
						},
						pairedItem: i,
					});
				} else {
					throw new NodeOperationError(this.getNode(), 'No response from LLM API', {
						itemIndex: i,
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: error instanceof Error ? error.message : 'Unknown error',
						},
						pairedItem: i,
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
