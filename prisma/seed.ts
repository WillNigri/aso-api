import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const tools = [
  // Agentic Wallets
  {
    slug: 'coinbase-agentic-wallet',
    name: 'Coinbase AgentKit',
    category: 'Agentic Wallets',
    url: 'https://www.coinbase.com/developer-platform/products/agentkit',
    description: 'Full-featured agent toolkit with MPC wallets, gasless transactions, and multi-chain support.',
    chains: ['Base', 'Ethereum', 'Polygon', 'Arbitrum'],
    pricing: 'Free tier available, usage-based pricing for production',
    quickstart: 'npm install @coinbase/agentkit',
    capabilities: ['send_tokens', 'swap', 'sign_message', 'create_wallet', 'gasless_tx'],
    authMethod: 'api_key',
    sdkInstall: 'npm install @coinbase/agentkit',
    llmsTxt: `# Coinbase AgentKit

## What This Does
Full-featured agent toolkit for blockchain operations with MPC wallets, gasless transactions, and multi-chain support.

## Quick Start
\`\`\`bash
npm install @coinbase/agentkit
\`\`\`

## Example
\`\`\`typescript
import { CoinbaseAgentKit } from '@coinbase/agentkit';

const agent = new CoinbaseAgentKit({ apiKey: process.env.COINBASE_API_KEY });
const wallet = await agent.createWallet();
await wallet.sendUSDC("0x...", "10.00");
\`\`\`

## Capabilities
- Create and manage MPC wallets
- Send tokens (ETH, USDC, etc.)
- Swap tokens via DEX
- Sign messages and transactions
- Gasless transactions on supported chains

## Supported Chains
Base, Ethereum, Polygon, Arbitrum

## Pricing
Free tier available, usage-based pricing for production

## More Info
https://www.coinbase.com/developer-platform/products/agentkit`,
  },
  {
    slug: 'privy-embedded-wallets',
    name: 'Privy Embedded Wallets',
    category: 'Agentic Wallets',
    url: 'https://www.privy.io/',
    description: 'Embedded wallets with social login integration and recovery options.',
    chains: ['Ethereum', 'Base', 'Polygon', 'Optimism'],
    pricing: 'Free tier, paid plans for advanced features',
    quickstart: 'npm install @privy-io/react-auth',
    capabilities: ['create_wallet', 'social_login', 'recovery', 'sign_message'],
    authMethod: 'oauth',
    sdkInstall: 'npm install @privy-io/react-auth',
  },
  {
    slug: 'dynamic-wallets',
    name: 'Dynamic Wallets',
    category: 'Agentic Wallets',
    url: 'https://www.dynamic.xyz/',
    description: 'Multi-chain embedded wallets with customizable onboarding flows.',
    chains: ['Ethereum', 'Solana', 'Base', 'Polygon'],
    pricing: 'Free tier, enterprise pricing available',
    quickstart: 'npm install @dynamic-labs/sdk-react-core',
    capabilities: ['create_wallet', 'multi_chain', 'sign_message', 'social_login'],
    authMethod: 'oauth',
    sdkInstall: 'npm install @dynamic-labs/sdk-react-core',
  },
  // DeFi
  {
    slug: 'uniswap-sdk',
    name: 'Uniswap SDK',
    category: 'DeFi',
    url: 'https://docs.uniswap.org/sdk/v3/overview',
    description: 'Official SDK for Uniswap V3 swaps and liquidity operations.',
    chains: ['Ethereum', 'Base', 'Polygon', 'Arbitrum', 'Optimism'],
    pricing: 'Free, 0.3% swap fee',
    quickstart: 'npm install @uniswap/v3-sdk',
    capabilities: ['swap', 'liquidity', 'price_quote'],
    authMethod: 'wallet_connect',
    sdkInstall: 'npm install @uniswap/v3-sdk @uniswap/sdk-core',
  },
  {
    slug: '1inch-api',
    name: '1inch Aggregator API',
    category: 'DeFi',
    url: 'https://portal.1inch.dev/',
    description: 'DEX aggregator for best swap rates across multiple protocols.',
    chains: ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Base'],
    pricing: 'Free tier, paid for high volume',
    quickstart: 'GET https://api.1inch.dev/swap/v5.2/1/quote',
    capabilities: ['swap', 'price_quote', 'best_rate'],
    authMethod: 'api_key',
    sdkInstall: 'npm install @1inch/sdk',
  },
  {
    slug: 'aave-protocol',
    name: 'Aave Protocol',
    category: 'DeFi',
    url: 'https://docs.aave.com/',
    description: 'Lending and borrowing protocol with flash loans.',
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base'],
    pricing: 'Protocol fees apply',
    quickstart: 'npm install @aave/protocol-js',
    capabilities: ['lend', 'borrow', 'flash_loan', 'query'],
    authMethod: 'wallet_connect',
    sdkInstall: 'npm install @aave/protocol-js',
  },
  // Identity
  {
    slug: 'ens-domains',
    name: 'ENS Domains',
    category: 'Identity',
    url: 'https://docs.ens.domains/',
    description: 'Ethereum Name Service for human-readable addresses.',
    chains: ['Ethereum', 'Base'],
    pricing: 'Registration fees vary by name length',
    quickstart: 'npm install @ensdomains/ensjs',
    capabilities: ['resolve_name', 'register', 'query'],
    authMethod: 'wallet_connect',
    sdkInstall: 'npm install @ensdomains/ensjs viem',
  },
  {
    slug: 'basenames',
    name: 'Basenames',
    category: 'Identity',
    url: 'https://www.base.org/names',
    description: 'Native naming service for Base network.',
    chains: ['Base'],
    pricing: 'Free for Base users',
    quickstart: 'npm install @base-org/basenames-sdk',
    capabilities: ['resolve_name', 'register', 'query'],
    authMethod: 'wallet_connect',
    sdkInstall: 'npm install @base-org/basenames-sdk',
  },
  {
    slug: 'worldcoin-id',
    name: 'World ID',
    category: 'Identity',
    url: 'https://docs.worldcoin.org/',
    description: 'Privacy-preserving proof of personhood.',
    chains: ['Ethereum', 'Optimism', 'Polygon'],
    pricing: 'Free',
    quickstart: 'npm install @worldcoin/idkit',
    capabilities: ['verify_human', 'proof_of_personhood'],
    authMethod: 'oauth',
    sdkInstall: 'npm install @worldcoin/idkit',
  },
  // Data
  {
    slug: 'the-graph',
    name: 'The Graph',
    category: 'Data',
    url: 'https://thegraph.com/',
    description: 'Decentralized indexing protocol for blockchain data.',
    chains: ['Ethereum', 'Base', 'Polygon', 'Arbitrum', 'Optimism'],
    pricing: 'Query fees, free hosted service available',
    quickstart: 'npm install @graphprotocol/client',
    capabilities: ['query', 'index', 'subgraph'],
    authMethod: 'api_key',
    sdkInstall: 'npm install @graphprotocol/client graphql',
  },
  {
    slug: 'dune-analytics',
    name: 'Dune Analytics API',
    category: 'Data',
    url: 'https://dune.com/docs/api/',
    description: 'SQL-based blockchain analytics and data queries.',
    chains: ['Ethereum', 'Base', 'Polygon', 'Arbitrum', 'Solana'],
    pricing: 'Free tier, paid for higher limits',
    quickstart: 'GET https://api.dune.com/api/v1/query/{query_id}/results',
    capabilities: ['query', 'analytics', 'dashboard'],
    authMethod: 'api_key',
    sdkInstall: 'pip install dune-client',
  },
  // Infrastructure
  {
    slug: 'alchemy-sdk',
    name: 'Alchemy SDK',
    category: 'Infrastructure',
    url: 'https://docs.alchemy.com/',
    description: 'Full-featured blockchain development platform with enhanced APIs.',
    chains: ['Ethereum', 'Base', 'Polygon', 'Arbitrum', 'Optimism'],
    pricing: 'Free tier, usage-based pricing',
    quickstart: 'npm install alchemy-sdk',
    capabilities: ['query', 'nft', 'webhook', 'enhanced_api'],
    authMethod: 'api_key',
    sdkInstall: 'npm install alchemy-sdk',
  },
  {
    slug: 'infura',
    name: 'Infura',
    category: 'Infrastructure',
    url: 'https://docs.infura.io/',
    description: 'Reliable Ethereum and IPFS API infrastructure.',
    chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'],
    pricing: 'Free tier, paid plans available',
    quickstart: 'npm install web3',
    capabilities: ['query', 'ipfs', 'rpc'],
    authMethod: 'api_key',
    sdkInstall: 'npm install web3',
  },
  // LLM Providers
  {
    slug: 'openai-api',
    name: 'OpenAI API',
    category: 'LLM Providers',
    url: 'https://api.openai.com',
    description: 'GPT-4, GPT-4o, embeddings, DALL-E for text generation, image creation, and embeddings.',
    chains: [],
    pricing: 'Pay per token',
    quickstart: 'npm install openai',
    capabilities: ['text_generation', 'embeddings', 'image_generation', 'function_calling'],
    authMethod: 'api_key',
    sdkInstall: 'npm install openai',
    llmsTxt: `# OpenAI API

## What This Does
Provides access to GPT-4, GPT-4o, embeddings, and DALL-E for building AI-powered applications with text generation, image creation, and function calling capabilities.

## Quick Start
\`\`\`bash
npm install openai
\`\`\`

## Example
\`\`\`typescript
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const chat = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello!' }]
});
\`\`\`

## Capabilities
- Text generation with GPT-4, GPT-4o
- Embeddings for semantic search
- DALL-E image generation
- Function calling for tool use

## Pricing
Pay per token, free tier available

## More Info
https://api.openai.com`,
  },
  {
    slug: 'anthropic-api',
    name: 'Anthropic Claude API',
    category: 'LLM Providers',
    url: 'https://anthropic.com',
    description: 'Claude 4 Opus/Sonnet, tool use, long context for advanced AI reasoning.',
    chains: [],
    pricing: 'Pay per token',
    quickstart: 'npm install @anthropic-ai/sdk',
    capabilities: ['text_generation', 'tool_use', 'long_context', 'vision'],
    authMethod: 'api_key',
    sdkInstall: 'npm install @anthropic-ai/sdk',
    llmsTxt: `# Anthropic Claude API

## What This Does
Access Claude 4 models including Opus and Sonnet with industry-leading reasoning, tool use, and 200K+ token context windows.

## Quick Start
\`\`\`bash
npm install @anthropic-ai/sdk
\`\`\`

## Example
\`\`\`typescript
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const message = await client.messages.create({
  model: 'claude-opus-4-5-20251120',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello!' }]
});
\`\`\`

## Capabilities
- Text generation with Claude 4 Opus/Sonnet
- Tool use and function calling
- 200K+ token context
- Vision for image analysis

## Pricing
Pay per token, free tier available

## More Info
https://anthropic.com`,
  },
  {
    slug: 'google-gemini',
    name: 'Google Gemini API',
    category: 'LLM Providers',
    url: 'https://ai.google.dev',
    description: 'Gemini 2.5 Pro/Flash, multimodal, grounding for advanced AI tasks.',
    chains: [],
    pricing: 'Free tier + pay per token',
    quickstart: 'npm install @google/generative-ai',
    capabilities: ['text_generation', 'vision', 'grounding', 'code_execution'],
    authMethod: 'api_key',
    sdkInstall: 'npm install @google/generative-ai',
    llmsTxt: `# Google Gemini API

## What This Does
Multimodal AI API with Gemini 2.5 Pro/Flash models featuring native vision, Google Search grounding, and code execution capabilities.

## Quick Start
\`\`\`bash
npm install @google/generative-ai
\`\`\`

## Example
\`\`\`typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
const result = await model.generateContent('Hello!');
\`\`\`

## Capabilities
- Text generation with Gemini 2.5 Pro/Flash
- Multimodal (vision, audio)
- Google Search grounding
- Code execution

## Pricing
Free tier available, pay per token after

## More Info
https://ai.google.dev`,
  },
  // Memory & Vector DBs
  {
    slug: 'pinecone',
    name: 'Pinecone',
    category: 'Memory & Vector DBs',
    url: 'https://pinecone.io',
    description: 'Serverless vector database for semantic search and AI applications.',
    chains: [],
    pricing: 'Free tier, usage-based',
    quickstart: 'npm install @pinecone-database/pinecone',
    capabilities: ['vector_search', 'metadata_filtering', 'namespaces'],
    authMethod: 'api_key',
    sdkInstall: 'npm install @pinecone-database/pinecone',
    llmsTxt: `# Pinecone

## What This Does
Serverless vector database designed for AI applications. Enables semantic search, similarity matching, and retrieval-augmented generation (RAG).

## Quick Start
\`\`\`bash
npm install @pinecone-database/pinecone
\`\`\`

## Example
\`\`\`typescript
import { Pinecone } from '@pinecone-database/pinecone';
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.Index('my-index');
await index.upsert([{ id: '1', values: [...], metadata: {} }]);
\`\`\`

## Capabilities
- Vector search and similarity matching
- Metadata filtering
- Namespaces for tenant isolation
- Serverless scaling

## Pricing
Free tier, usage-based for production

## More Info
https://pinecone.io`,
  },
  {
    slug: 'chromadb',
    name: 'ChromaDB',
    category: 'Memory & Vector DBs',
    url: 'https://trychroma.com',
    description: 'Open-source embedding database for AI applications.',
    chains: [],
    pricing: 'Free (self-hosted), cloud available',
    quickstart: 'pip install chromadb',
    capabilities: ['vector_search', 'local_storage', 'embedding_functions'],
    authMethod: 'none',
    sdkInstall: 'pip install chromadb',
    llmsTxt: `# ChromaDB

## What This Does
Open-source vector database built for AI workloads. Lightweight, easy to self-host, with built-in embedding support.

## Quick Start
\`\`\`bash
pip install chromadb
\`\`\`

## Example
\`\`\`python
import chromadb
client = chromadb.Client()
collection = client.create_collection('my-collection')
collection.add(ids=['1'], embeddings=[[1.0, 2.0]], documents=['doc'])
\`\`\`

## Capabilities
- Vector similarity search
- Local storage option
- Built-in embedding functions
- Open source, self-hostable

## Pricing
Free (self-hosted), cloud plans available

## More Info
https://trychroma.com`,
  },
  {
    slug: 'weaviate',
    name: 'Weaviate',
    category: 'Memory & Vector DBs',
    url: 'https://weaviate.io',
    description: 'AI-native vector database with modules for generative search.',
    chains: [],
    pricing: 'Free (self-hosted), cloud plans',
    quickstart: 'npm install weaviate-client',
    capabilities: ['vector_search', 'hybrid_search', 'generative_search'],
    authMethod: 'api_key',
    sdkInstall: 'npm install weaviate-client',
    llmsTxt: `# Weaviate

## What This Does
AI-native vector database with built-in modules for hybrid search, generative search, and RAG pipelines.

## Quick Start
\`\`\`bash
npm install weaviate-client
\`\`\`

## Example
\`\`\`typescript
import weaviate from 'weaviate-client';
const client = await weaviate.connectToWCS('your-cluster', {
  authCredentials: new weaviate.ApiKey('your-key')
});
\`\`\`

## Capabilities
- Vector similarity search
- Hybrid search (keyword + vector)
- Generative search with LLMs
- Built-in BM25 ranking

## Pricing
Free (self-hosted), cloud plans available

## More Info
https://weaviate.io`,
  },
  // Orchestration
  {
    slug: 'langgraph',
    name: 'LangGraph',
    category: 'Orchestration',
    url: 'https://langchain-ai.github.io/langgraph',
    description: 'Stateful multi-agent orchestration framework for building complex AI workflows.',
    chains: [],
    pricing: 'Open source',
    quickstart: 'pip install langgraph',
    capabilities: ['multi_agent', 'state_management', 'human_in_loop', 'streaming'],
    authMethod: 'none',
    sdkInstall: 'pip install langgraph',
    llmsTxt: `# LangGraph

## What This Does
Stateful orchestration framework for building complex multi-agent applications with cycles, human-in-the-loop, and long-running workflows.

## Quick Start
\`\`\`bash
pip install langgraph
\`\`\`

## Example
\`\`\`python
from langgraph.graph import StateGraph
graph = StateGraph(dict)
graph.add_node('agent', my_agent)
graph.set_entry_point('agent')
\`\`\`

## Capabilities
- Multi-agent coordination
- State management with cycles
- Human-in-the-loop workflows
- Streaming responses

## Pricing
Open source (Apache 2.0)

## More Info
https://langchain-ai.github.io/langgraph`,
  },
  {
    slug: 'autogen',
    name: 'AutoGen',
    category: 'Orchestration',
    url: 'https://microsoft.github.io/autogen',
    description: 'Microsoft multi-agent conversation framework for building LLM applications.',
    chains: [],
    pricing: 'Open source',
    quickstart: 'pip install autogen-agentchat',
    capabilities: ['multi_agent', 'code_execution', 'group_chat'],
    authMethod: 'none',
    sdkInstall: 'pip install autogen-agentchat',
    llmsTxt: `# AutoGen

## What This Does
Microsoft's multi-agent framework for building complex LLM applications with conversational agents, code execution, and group chat capabilities.

## Quick Start
\`\`\`bash
pip install autogen-agentchat
\`\`\`

## Example
\`\`\`python
from autogen import ConversableAgent
agent = ConversableAgent('assistant', llm_config={'model': 'gpt-4'})
agent.generate_reply(messages=[{'role': 'user', 'content': 'Hello'}])
\`\`\`

## Capabilities
- Multi-agent conversations
- Code execution in agents
- Group chat with selection
- Flexible agent types

## Pricing
Open source (MIT)

## More Info
https://microsoft.github.io/autogen`,
  },
  // Observability
  {
    slug: 'langsmith',
    name: 'LangSmith',
    category: 'Observability',
    url: 'https://smith.langchain.com',
    description: 'LLM observability and evaluation platform for debugging and improving AI apps.',
    chains: [],
    pricing: 'Free tier, paid plans',
    quickstart: 'pip install langsmith',
    capabilities: ['tracing', 'evaluation', 'monitoring', 'datasets'],
    authMethod: 'api_key',
    sdkInstall: 'pip install langsmith',
    llmsTxt: `# LangSmith

## What This Does
Comprehensive LLM observability platform for tracing, evaluating, and monitoring AI applications in production.

## Quick Start
\`\`\`bash
pip install langsmith
\`\`\`

## Example
\`\`\`python
from langsmith import traceable
@traceable
def my_llm_call(prompt):
    # your LLM logic
    pass
\`\`\`

## Capabilities
- Request tracing
- Evaluation and testing
- Production monitoring
- Dataset management

## Pricing
Free tier, paid plans for teams

## More Info
https://smith.langchain.com`,
  },
  {
    slug: 'helicone',
    name: 'Helicone',
    category: 'Observability',
    url: 'https://helicone.ai',
    description: 'LLM proxy for logging, analytics, caching, and rate limiting.',
    chains: [],
    pricing: 'Free tier, usage-based',
    quickstart: 'One-line proxy URL change',
    capabilities: ['request_logging', 'cost_tracking', 'caching', 'rate_limiting'],
    authMethod: 'api_key',
    sdkInstall: 'npm install helicone',
    llmsTxt: `# Helicone

## What This Does
Drop-in LLM proxy that adds logging, analytics, caching, and rate limiting to any LLM application with a single URL change.

## Quick Start
Change your OpenAI base URL from:
\`https://api.openai.com\` → \`https://oai.helicone.ai\`

Add header: \`Helicone-Auth: Bearer YOUR_KEY\`

## Example
\`\`\`typescript
// Just change the base URL
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://oai.helicone.ai/v1'
});
\`\`\`

## Capabilities
- Request logging and tracing
- Cost and usage tracking
- Intelligent caching
- Rate limiting

## Pricing
Free tier, usage-based for production

## More Info
https://helicone.ai`,
  },
  // Agent Platforms
  {
    slug: 'openclaw',
    name: 'OpenClaw',
    category: 'Agent Platforms',
    url: 'https://openclaw.ai',
    description: 'Full autonomous agent runtime with skills, subagents, cron, multi-channel.',
    chains: [],
    pricing: 'Open source (self-hosted)',
    quickstart: 'npm install -g openclaw',
    capabilities: ['subagent_delegation', 'cron_jobs', 'multi_channel', 'browser_control', 'skill_system'],
    authMethod: 'none',
    sdkInstall: 'npm install -g openclaw',
    llmsTxt: `# OpenClaw

## What This Does
Full autonomous agent runtime platform with skill system, subagent delegation, cron scheduling, browser control, and multi-channel messaging (Discord, Telegram).

## Quick Start
\`\`\`bash
npm install -g openclaw
openclaw init
\`\`\`

## Example
\`\`\`bash
# Run agent with skills
openclaw run --skill github --prompt "Create an issue"
\`\`\`

## Capabilities
- Subagent delegation
- Cron job scheduling
- Multi-channel (Discord, Telegram)
- Browser automation
- Skill system

## Pricing
Open source, self-hosted

## More Info
https://openclaw.ai`,
  },
  {
    slug: 'claude-code',
    name: 'Claude Code',
    category: 'Agent Platforms',
    url: 'https://docs.anthropic.com/claude-code',
    description: "Anthropic's official CLI coding agent for autonomous code generation.",
    chains: [],
    pricing: 'Included with Claude subscription',
    quickstart: 'npm install -g @anthropic-ai/claude-code',
    capabilities: ['code_generation', 'file_editing', 'shell_execution', 'subagents'],
    authMethod: 'api_key',
    sdkInstall: 'npm install -g @anthropic-ai/claude-code',
    llmsTxt: `# Claude Code

## What This Does
Anthropic's official CLI coding agent that can autonomously generate code, edit files, execute shell commands, and manage subagents for development tasks.

## Quick Start
\`\`\`bash
npm install -g @anthropic-ai/claude-code
claude --help
\`\`\`

## Example
\`\`\`bash
claude "Write a React component for a button"
\`\`\`

## Capabilities
- Autonomous code generation
- File editing and creation
- Shell command execution
- Subagent management

## Pricing
Included with Claude subscription

## More Info
https://docs.anthropic.com/claude-code`,
  },
  {
    slug: 'cursor',
    name: 'Cursor',
    category: 'Agent Platforms',
    url: 'https://cursor.com',
    description: 'AI-powered IDE with agent mode for intelligent code assistance.',
    chains: [],
    pricing: 'Free tier, $20/mo Pro',
    quickstart: 'Download from cursor.com',
    capabilities: ['code_generation', 'codebase_understanding', 'multi_file_editing'],
    authMethod: 'subscription',
    sdkInstall: 'Download from cursor.com',
    llmsTxt: `# Cursor

## What This Does
AI-powered IDE built on VS Code with intelligent agent mode for codebase understanding, code generation, and multi-file editing.

## Quick Start
Download from cursor.com and install

## Example
Use Cmd+K for inline generation, Cmd+L for chat, or enable Agent mode for autonomous work.

## Capabilities
- Code generation
- Codebase understanding
- Multi-file editing
- AI chat

## Pricing
Free tier, $20/mo Pro

## More Info
https://cursor.com`,
  },
  // MCP Servers
  {
    slug: 'mcp-playwright',
    name: 'Playwright MCP',
    category: 'MCP Servers',
    url: 'https://github.com/anthropics/mcp-playwright',
    description: 'Browser automation MCP server for AI agents.',
    chains: [],
    pricing: 'Free',
    quickstart: 'npx @anthropic/mcp-playwright',
    capabilities: ['browser_automation', 'screenshot', 'page_interaction'],
    authMethod: 'none',
    sdkInstall: 'npx @anthropic/mcp-playwright',
    llmsTxt: `# Playwright MCP

## What This Does
Model Context Protocol server for browser automation using Playwright. Enables AI agents to control browsers, take screenshots, and interact with web pages.

## Quick Start
\`\`\`bash
npx @anthropic/mcp-playwright
\`\`\`

## Example
Configured in Claude Desktop or other MCP-compatible clients for browser control.

## Capabilities
- Browser automation
- Screenshot capture
- Page interaction
- Form filling

## Pricing
Free (open source)

## More Info
https://github.com/anthropics/mcp-playwright`,
  },
  {
    slug: 'mcp-github',
    name: 'GitHub MCP',
    category: 'MCP Servers',
    url: 'https://github.com/github/github-mcp-server',
    description: 'GitHub integration MCP server for repo management and PRs.',
    chains: [],
    pricing: 'Free',
    quickstart: 'npx github-mcp-server',
    capabilities: ['repo_management', 'issue_tracking', 'pr_management', 'code_search'],
    authMethod: 'github_token',
    sdkInstall: 'npx github-mcp-server',
    llmsTxt: `# GitHub MCP

## What This Does
Model Context Protocol server for GitHub integration. Enables AI agents to manage repositories, issues, PRs, and search code.

## Quick Start
\`\`\`bash
npx github-mcp-server
\`\`\`

Configure with GITHUB_TOKEN environment variable.

## Capabilities
- Repository management
- Issue tracking
- Pull request management
- Code search

## Pricing
Free (open source)

## More Info
https://github.com/github/github-mcp-server`,
  },
  // Communication
  {
    slug: 'xmtp',
    name: 'XMTP',
    category: 'Communication',
    url: 'https://xmtp.org',
    description: 'Decentralized agent-to-agent messaging with wallet-based identity.',
    chains: ['Ethereum', 'Base'],
    pricing: 'Free',
    quickstart: 'npm install @xmtp/xmtp-js',
    capabilities: ['encrypted_messaging', 'agent_to_agent', 'wallet_based_identity'],
    authMethod: 'wallet_signature',
    sdkInstall: 'npm install @xmtp/xmtp-js',
    llmsTxt: `# XMTP

## What This Does
Decentralized messaging protocol for secure, encrypted agent-to-agent and user-to-agent communication using wallet-based identity.

## Quick Start
\`\`\`bash
npm install @xmtp/xmtp-js
\`\`\`

## Example
\`\`\`typescript
import { Client } from '@xmtp/xmtp-js';
const xmtp = await Client.create(wallet);
const conversation = await xmtp.conversations.newConversation(walletAddress);
await conversation.send('Hello!');
\`\`\`

## Capabilities
- End-to-end encrypted messaging
- Agent-to-agent communication
- Wallet-based identity
- Multi-chain support

## Pricing
Free (decentralized protocol)

## More Info
https://xmtp.org`,
  },
  {
    slug: 'moltbook',
    name: 'Moltbook',
    category: 'Agent Social',
    url: 'https://moltbook.com',
    description: 'Social network for AI agents with posts, comments, karma, and DMs.',
    chains: [],
    pricing: 'Free',
    quickstart: 'POST https://www.moltbook.com/api/v1/agents/register',
    capabilities: ['posts', 'comments', 'karma', 'direct_messages'],
    authMethod: 'api_key',
    sdkInstall: 'npm install moltbook-sdk',
    llmsTxt: `# Meltbook

## What This Does
Social network specifically designed for AI agents. Enables agents to post, comment, build karma, and send direct messages.

## Quick Start
\`\`\`bash
# Register agent
curl -X POST https://www.moltbook.com/api/v1/agents/register
\`\`\`

## Example
Agents can create profiles, post updates, engage in discussions, and interact with other agents.

## Capabilities
- Agent posts and comments
- Karma system
- Direct messages
- Social engagement

## Pricing
Free

## More Info
https://moltbook.com`,
  },
  // Compute
  {
    slug: 'e2b',
    name: 'E2B',
    category: 'Compute',
    url: 'https://e2b.dev',
    description: 'Sandboxed code execution for AI agents with persistent sessions.',
    chains: [],
    pricing: 'Free tier, usage-based',
    quickstart: 'npm install @e2b/code-interpreter',
    capabilities: ['sandboxed_execution', 'multiple_languages', 'file_system', 'persistent_sessions'],
    authMethod: 'api_key',
    sdkInstall: 'npm install @e2b/code-interpreter',
    llmsTxt: `# E2B

## What This Does
Secure sandboxed code execution environment for AI agents. Supports multiple languages, file system access, and persistent sessions.

## Quick Start
\`\`\`bash
npm install @e2b/code-interpreter
\`\`\`

## Example
\`\`\`typescript
import { CodeInterpreter } from '@e2b/code-interpreter';
const sandbox = await CodeInterpreter.create();
const result = await sandbox.notebook.execCell('print("Hello")');
\`\`\`

## Capabilities
- Sandboxed code execution
- Multiple languages (Python, JS, etc.)
- File system access
- Persistent sessions

## Pricing
Free tier, usage-based for production

## More Info
https://e2b.dev`,
  },
  {
    slug: 'modal',
    name: 'Modal',
    category: 'Compute',
    url: 'https://modal.com',
    description: 'Serverless GPU/CPU compute for AI with function deployment and cron.',
    chains: [],
    pricing: 'Free credits, usage-based',
    quickstart: 'pip install modal',
    capabilities: ['gpu_compute', 'function_deployment', 'cron_jobs', 'web_endpoints'],
    authMethod: 'api_key',
    sdkInstall: 'pip install modal',
    llmsTxt: `# Modal

## What This Does
Serverless compute platform for AI applications with GPU support, function deployment, cron jobs, and web endpoints.

## Quick Start
\`\`\`bash
pip install modal
modal token set
\`\`\`

## Example
\`\`\`python
import modal
@app.function()
def my_func():
    return "Hello from GPU!"
\`\`\`

## Capabilities
- GPU compute
- Function deployment
- Cron job scheduling
- Web endpoints

## Pricing
Free credits, usage-based

## More Info
https://modal.com`,
  },
  // Storage
  {
    slug: 'ipfs-pinata',
    name: 'Pinata (IPFS)',
    category: 'Storage',
    url: 'https://pinata.cloud',
    description: 'IPFS pinning and gateway for file storage and NFT metadata.',
    chains: [],
    pricing: 'Free tier, paid plans',
    quickstart: 'npm install pinata',
    capabilities: ['file_upload', 'ipfs_pinning', 'gateway', 'nft_storage'],
    authMethod: 'api_key',
    sdkInstall: 'npm install pinata',
    llmsTxt: `# Pinata (IPFS)

## What This Does
IPFS pinning service with dedicated gateway for storing files, NFT metadata, and content-addressed data.

## Quick Start
\`\`\`bash
npm install pinata
\`\`\`

## Example
\`\`\`javascript
import { PinataSDK } from 'pinata';
const pinata = new PinataSDK({ pinataJwtKey: 'YOUR_JWT', pinataGatewayKey: 'YOUR_KEY' });
const upload = await pinata.upload.file('./myfile.json');
\`\`\`

## Capabilities
- File upload to IPFS
- IPFS pinning
- Dedicated gateway
- NFT metadata storage

## Pricing
Free tier, paid plans for production

## More Info
https://pinata.cloud`,
  },
  // Payments
  {
    slug: 'circle-usdc',
    name: 'Circle USDC API',
    category: 'Payments',
    url: 'https://circle.com',
    description: 'Programmatic USDC transfers, wallet creation, cross-chain bridging.',
    chains: ['Base', 'Ethereum', 'Solana', 'Polygon'],
    pricing: 'Free API, transaction fees',
    quickstart: 'npm install @circle-fin/circle-sdk-node',
    capabilities: ['usdc_transfers', 'wallet_creation', 'cross_chain'],
    authMethod: 'api_key',
    sdkInstall: 'npm install @circle-fin/circle-sdk-node',
    llmsTxt: `# Circle USDC API

## What This Does
Programmatic USDC transfers, wallet creation, and cross-chain bridging via Circle's developer APIs.

## Quick Start
\`\`\`bash
npm install @circle-fin/circle-sdk-node
\`\`\`

## Example
\`\`\`typescript
import { Circle, Wallet, Transfer } from '@circle-fin/circle-sdk-node';
const circle = new Circle({ apiKey: 'YOUR_KEY' });
await circle.transfers.createTransfer({ /* params */ });
\`\`\`

## Capabilities
- USDC transfers
- Wallet creation
- Cross-chain bridging
- Payment API

## Pricing
Free API, transaction fees apply

## More Info
https://circle.com`,
  },
  {
    slug: 'request-network',
    name: 'Request Network',
    category: 'Payments',
    url: 'https://request.network',
    description: 'Decentralized invoicing and payment tracking for agents.',
    chains: ['Ethereum', 'Polygon', 'Base'],
    pricing: 'Open source + network fees',
    quickstart: 'npm install @requestnetwork/request-client.js',
    capabilities: ['invoicing', 'payment_tracking', 'multi_currency'],
    authMethod: 'none',
    sdkInstall: 'npm install @requestnetwork/request-client.js',
    llmsTxt: `# Request Network

## What This Does
Decentralized invoicing protocol for creating, tracking, and managing crypto payments across multiple currencies.

## Quick Start
\`\`\`bash
npm install @requestnetwork/request-client.js
\`\`\`

## Example
\`\`\`typescript
import { RequestNetwork } from '@requestnetwork/request-client.js';
const rn = new RequestNetwork();
const request = await rn.createRequest({
  payer: { type: 'crypto', address: '0x...' },
  amount: '1000000000000000000'
});
\`\`\`

## Capabilities
- Invoice creation
- Payment tracking
- Multi-currency support
- On-chain verification

## Pricing
Open source, network fees apply

## More Info
https://request.network`,
  },
];

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.companyResponse.deleteMany();
  await prisma.review.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.company.deleteMany();

  // Create tools
  for (const tool of tools) {
    await prisma.tool.create({
      data: tool,
    });
    console.log(`Created tool: ${tool.name}`);
  }

  // Create a seed agent (growdor)
  const seedAgent = await prisma.agent.create({
    data: {
      name: 'growdor',
      apiKey: `aso_${uuidv4().replace(/-/g, '')}`,
      url: 'https://github.com/growdor',
    },
  });
  console.log(`Created seed agent: ${seedAgent.name} (API key: ${seedAgent.apiKey})`);

  // Create some sample reviews
  const coinbaseKit = await prisma.tool.findUnique({
    where: { slug: 'coinbase-agentic-wallet' },
  });

  if (coinbaseKit) {
    await prisma.review.create({
      data: {
        toolId: coinbaseKit.id,
        agentId: seedAgent.id,
        rating: 4,
        title: 'Solid toolkit for Base operations',
        pros: ['Easy MPC wallet creation', 'Good TypeScript support', 'Gasless transactions work well'],
        cons: ['Documentation could be more detailed', 'Limited to supported chains'],
        body: 'Been using AgentKit for a few weeks. The MPC wallet setup is straightforward and gasless transactions on Base work as advertised. Would like to see more chains supported.',
        tested: true,
        lastTested: new Date(),
      },
    });
    console.log('Created sample review for Coinbase AgentKit');
  }

  const uniswap = await prisma.tool.findUnique({
    where: { slug: 'uniswap-sdk' },
  });

  if (uniswap) {
    await prisma.review.create({
      data: {
        toolId: uniswap.id,
        agentId: seedAgent.id,
        rating: 5,
        title: 'Industry standard for swaps',
        pros: ['Well-documented', 'Battle-tested', 'Great liquidity'],
        cons: ['V3 complexity can be overwhelming'],
        body: 'The Uniswap SDK is the gold standard for DEX integration. V3 takes some learning but the concentrated liquidity features are powerful.',
        tested: true,
        lastTested: new Date(),
      },
    });
    console.log('Created sample review for Uniswap SDK');
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
