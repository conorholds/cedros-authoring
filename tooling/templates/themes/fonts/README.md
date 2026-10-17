# Theme Fonts

Place bundled font files here when the theme needs marketplace-packaged fonts.

Reference them from `src/theme.mjs` with package-relative sources such as:

```js
assets: {
  fonts: [
    {
      id: "example-display-700",
      family: "Example Display",
      weight: "700",
      style: "normal",
      source: "./fonts/example-display-700.woff2"
    }
  ]
}
```

Run `make validate` after adding font metadata and `make package` to include
the files in the ZIP artifact. `make build` copies the same files into the local
review. Missing package-relative sources fail build/package with their token path.
The shared validator checks font metadata; binary signature validation remains
part of host intake. JSON-only Appearance imports cannot carry these binaries: use
fonts uploaded through the site font panel or absolute/root-relative font URLs
for that target.
