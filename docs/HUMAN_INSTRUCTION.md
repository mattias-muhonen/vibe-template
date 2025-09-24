# Best Practices
AI is Everyone and Everything
- Make it be what you want it to be
- Make it do what you want it to do

## Managing Context
Managing context is everything and depends a lot on the model that is being used. In practice it would make sense to use larger reasoning models to work on the documentation and smaller tool-use models to do the implementation. It is evident in the source material that documentation should be roughly on three tiers: overview, functionality and tasks. It also seems the utilizing some documents in a system prompt manner and others as normal prompt yields the best outcome. The goal is to chain the documents together to give the AI as detailed a picture as possible.

### System Prompts:
System prompts should always point the AI in the right direction for every prompt and it should be instructed to be the team mate that the user wants.
- AI instruction, personality, communication style
- Overview document(s) with architecture and technologies + rules to always follow

### Implementation Prompts:
For implementation prompts the optimal content should follow a full-stack approach, remember the AI already gets the context from the system prompt. Implementation prompt should also follow some document so a spec. The contents should be something like this:
- Feature overview
- BDD user scenarios
- Database / types
- Endpoints
- Frontend functionality
- Gate/acceptance

### Plan the implementation:
And from this feature overview + some detail one should derive the tasks:

1. For TDD, write tests based on user scenario and acceptance criteria
2. Implement database
3. Implement queries and endpoints
4. Implement api-calls/store in frontend
5. Implement UI components and views
6. Run gate/acceptance scenario, automated tests or manual

## Practical Workflow for Builders
1. Have an idea for product
2. Flesh out the idea into PRDs or similar high-level documentation
3. Derive architecture from the PRDs
4. Derive feature documents with PRD and architecture
5. Derive implementation tasks from the feature doc
6. Implement <-> Verify
7. Release

## Critical Points and Tips
AI is non-deterministic by nature, it will hallucinate or do something stupid. It is critical to make sure that the documents used in prompting are kept clean of hallucinations, e.g. "audit trail" on one document will soon poison everything as you iterate and update the code and docs. Here are some guidelines:

- **"Normalize" documents** so that each fact exists only once in one file
- **Documents should only contain what must exist**, no speculation or guesses or extra
- **Always clean documents**, define a prompt for that, run it often
- **AI will make unnecessary edits**, see the point above
- **AI will search for files** so it may help to have youre spec, types, openapi, UI components share a common file name like `authentication` or `shopping-cart`
- **Context callback** if you're using e.g. personalities have them sign replies with something, once the reply starts vanishing you know context is getting lost
