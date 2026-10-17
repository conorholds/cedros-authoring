# Build a custom page

A custom page lets you create a specific experience for your Cedros website: a campaign landing page, an interactive buying guide, a product comparison, or a page with a layout your business needs.

Start with Page Builder's existing blocks and shared layouts when they cover your design. Use this starter when you want to write the page yourself. If the same feature needs to work across many pages or connect to business data, consider a [custom extension](extensions.md).

## Create your project

From the Cedros Authoring repository:

```sh
npm run page -- ../my-page
cd ../my-page
make install
```

The directory name supplies the page ID and initial route. For a different route, add `--route /summer-offer` to the creation command above.

## Make it yours

| File | What to edit |
| --- | --- |
| `page.json` | Page title, URL path, and search visibility |
| `page.tsx` | The page visitors see in a web browser |
| `page.native.tsx` | The matching experience for native clients |
| `page.md` | A readable text version of the same content |

Keep the content, links, and main actions consistent across the three versions. The starter supports React for the web and React Native for native clients; it keeps each page self-contained.

Check and package your work:

```sh
make test
make package
```

The files are collected in `dist/my-page.cedros-page.zip` for handoff. This ZIP holds page source; uploading it as an extension will not install a page.

## Add it to your site

Create or open the destination page in Cedros Page Builder. Use the title and route from `page.json`, then add a **Raw Code** block, Cedros's block for custom page code:

| Source | Block field |
| --- | --- |
| `page.tsx` | `reactCode` |
| `page.native.tsx` | `reactNativeCode` |
| `page.md` | `markdownCode` |

Updating the React code requires administrator access. Preview the saved page on desktop and mobile, check its links and actions, and publish when you're ready. Cedros does not read `page.json` or import this folder automatically.

An assistant can perform the same steps using your site's current Page Builder tools. See [working with an AI assistant](ai.md) and the generated project's README for that integration workflow.

[Back to Cedros Authoring](../README.md)
