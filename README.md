# n8n-nodes-flowengine-chat-model

This is an n8n community node. It lets you use [FlowEngine Chat Model](https://flowengine.cloud) in your n8n workflows.

FlowEngine Chat Model provides access to 100+ AI models (OpenAI, Anthropic, Google, Mistral, and more) through a unified API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### FlowEngine Chat Model Node

- **Chat Completion**: Send messages to any supported AI model
  - Filter models by provider (OpenAI, Anthropic, Google, Mistral, etc.)
  - Configure temperature and max tokens
  - Add optional system messages

### Supported Providers

- **Anthropic**: Claude 3 Haiku, Claude 3.5 Haiku, Claude 3.7 Sonnet, Claude 4 Sonnet, Claude 4.5 Opus
- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-5, GPT-5 Mini
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash, Gemini 2.5 Pro, Gemini 3 Pro
- **And more...**

## Credentials

### FlowEngine Chat Model API

To use this node, you need a FlowEngine API key:

1. Sign up at [flowengine.cloud](https://flowengine.cloud)
2. Go to [Settings](https://flowengine.cloud/settings)
3. Generate a new API key (starts with `fe_`)
4. Add the API key to your n8n credentials

## Compatibility

- Minimum n8n version: 1.0.0
- Tested with n8n versions: 1.40.0+

## Usage

### Basic Chat Completion

1. Add the **FlowEngine Chat Model** node to your workflow
2. Configure your FlowEngine Chat Model API credentials
3. Select a provider to filter available models (optional)
4. Choose your preferred AI model
5. Enter your message/prompt
6. Execute to get a response

### Using System Messages

1. Configure the node as above
2. In Options, add a System Message
3. The system message sets the AI's behavior/personality
4. Your message in the Message field is the user's input

### Configuring Temperature

- **0.0**: Deterministic, focused responses
- **0.7**: Balanced creativity (default)
- **2.0**: Maximum creativity/randomness

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [FlowEngine Documentation](https://flowengine.cloud/api-docs)
- [FlowEngine Website](https://flowengine.cloud)

## License

[MIT](LICENSE.md)
