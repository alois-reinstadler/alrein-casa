# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.17.0 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:none" paraglide="languageTags:en, es, de, tr, it+demo:yes" experimental="versions:kit+features:async,remoteFunctions,explicitEnvironmentVariables,handleRenderingErrors,forkPreloads" mdsvex --install pnpm alrein-casa
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Writing

The site is English. The blog lives at `/blog/`, with posts at
`/blog/your-english-slug/`.

Draft in `src/content/drafts/`; these files are not imported by the site.
Start with `src/content/drafts/first-post.md`. When ready, move the Markdown
file into `src/content/writing/` and give it a lowercase English filename
with words separated by hyphens. That filename becomes its URL.

Each post needs `title`, a quoted `date` in `YYYY-MM-DD` format, `topic`, and
`excerpt` in its frontmatter. Topics are free text (for example Politics,
Technology, or Personal). Posts appear newest first; the homepage shows the
latest three. Every file in `writing/` is published, regardless of date.
Keep unpublished material in `drafts/`.

Run `pnpm check` and `pnpm build` to validate and generate the static site.
Article pages are generated automatically from the published Markdown files.
