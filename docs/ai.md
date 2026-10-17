# Work with an AI assistant

You can use this kit yourself or ask an AI coding assistant to help build your customization. Give it the business goal, your Cedros site, and a clear description of what visitors or staff should be able to do.

Start with a brief such as:

> Read this repository's README and the custom-page guide. Create a campaign page for our summer workshop, with the schedule, pricing, and a registration link. Match our site's existing style and keep the web, native, and text versions consistent. Show me the result before changing the live site.

For a theme:

> Use the theme guide to create a theme for our architecture studio. Use a warm neutral palette, readable typography, and complete light and dark modes. Build the local previews and help me review it in Appearance before applying it.

For an extension:

> Read https://cedros.ai/skill.md and follow Extension Authoring. Use this kit to create a member area for our classes. Find the published Cedros Login contracts for accounts and Cedros Pay contracts for subscription access. Use supported capabilities and prepare a tested package for review.

## Give it the right context

- Share brand guidelines, example pages, and the outcome you want.
- Identify the target Cedros site so the assistant can read its current documentation and authorized tools.
- Tell it whether you want local files, a saved draft, an installation, or publication.
- Review the generated project's README, check results, and preview before going live.

The public kit includes an optional skill at `tooling/skills/cedros-authoring/SKILL.md`. An assistant that supports skills can load it for guidance specific to these starters. Each generated project also includes tailored `AGENTS.md` instructions.

Your site's `/skill.md` entry point and authenticated `/mcp` tools describe its installed features and permissions. Keep credentials in the assistant's configured connection rather than putting them in project files.

[Back to Cedros Authoring](../README.md)
