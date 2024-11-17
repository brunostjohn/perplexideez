<br/>
<div align="center">
<a href="assets/icon-frameless.png">
<img src="assets/icon-frameless.png" alt="Logo" width="100" height="100">
</a>
<h3 align="center">Perplexideez</h3>
<p align="center">
Self-hosted AI-powered search.
<br/>
<br/>
<a href="https://github.com/brunostjohn/perplexideez/issues/new?labels=bug&template=bug_report.md">Report Bug</a> ·
<a href="https://github.com/brunostjohn/perplexideez/issues/new?labels=enhancement&template=feature_request.md">Request Feature</a>
</p>
</div>

<h3 id="aboutTheProject">About The Project</h3>

![Screenshot](/assets/browser.png)

There are many self-hosted Perplexity clones out there. I chose to make my own as I was dissatisfied with their non-existent integration with other self-hosted services and lack of multi-user support. Perplexideez is backed by a Postgres database & either Ollama or OpenAI compatible endpoints. It searches the web using a SearXNG instance.

### Table of Contents

1. [About The Project](#aboutTheProject)
2. [Features](#features)
   1. [Search the web](#features-searchTheWeb)
   2. [Know where conclusions come from](#features-knowWhere)
      1. [Learn even more](#features-knowWhere-learnMore)
   3. [Keep track of your most interesting searches](#features-keepTrack)
   4. [Customise your experience](#features-customise)
   5. [Multi-user support & SSO](#features-multiUser)
   6. [Sharing searches](#features-sharing)
      1. [Simple UI](#features-sharing-simple)
      2. [Access control](#features-sharing-accessControl)
      3. [Good looking embeds](#features-sharing-embeds)
   7. [Deployment](#features-deployment)
      1. [Security](#features-deployment-security)
      2. [Statelessness](#features-deployment-statelessness)
3. [Deploying](#deploying)
   1. [Container images](#deploying-images)
   2. [Docker](#deploying-docker)
   3. [Kubernetes](#deploying-kube)
   4. [Bare metal](#deploying-metal)
   5. [General notes about dependencies](#deploying-notes)
      1. [SearXNG](#deploying-notes-searxng)
   6. [Environment variables](#deploying-env)
      1. [Data storage](#deploying-env-data)
      2. [App setup](#deploying-env-app)
      3. [SSO](#deploying-env-sso)
         1. [Notes](#deploying-env-sso-notes)
      4. [SearXNG](#deploying-env-searxng)
      5. [AI setup](#deploying-env-ai)
         1. [OpenAI](#deploying-env-ai-openai)
         2. [Ollama](#deploying-env-ai-ollama)
4. [Built with](#builtWith)
5. [Developing locally](#developingLocally)
   1. [Prerequisites](#developingLocally-pre)
   2. [Installation](#developingLocally-install)
6. [Roadmap](#roadmap)
7. [Contributing](#contributing)
8. [License](#license)
9. [Contact](#contact)
10. [Acknowledgments](#acknowledgments)

<h3 id="features">Features</h3>

<h4 id="features-searchTheWeb"> Search the web </h4>

![Screenshot](/assets/search.png)

Let AI do the hard work of sifting through search results for you.

<h4 id="features-knowWhere"> Know where conclusions come from </h4>

![Screenshot](/assets/sources.png)

Don't worry about hallucinations ruining your research. Just hover over the source annotation your LLM inserted and see the source it used. Click on it, and view the source directly.

<h5 id="features-knowWhere-learnMore"> Learn even more </h5>

![Screenshot](/assets/follow-up.png)

Your LLM will generate great follow-up questions for you. This way, you can ask about what interested you in the response without typing a single second.

<h4 id="features-keepTrack"> Keep track of your most interesting searches </h4>

![Screenshot](/assets/favourites.png)

Stash your favourite searches as favourites. This way, you'll never lose them.

<h4 id="features-customise"> Customise your experience </h4>

![Screenshot](/assets/model-picker.png)

Perplexideez lets you use different models for different tasks, as appropriate. The robust environment variables and UI configuration allow you to make sure your self hosted resources are not overused.

<h4 id="features-multiUser"> Multi-user support & SSO </h4>

![Screenshot](/assets/multiuser.png)

Perplexideez supports many user accounts, with separated data, and using OIDC SSO. You can disable either sign up, password login, or both.

<h4 id="features-sharing"> Sharing searches </h4>

<h5 id="featuers-sharing-simple"> Simple UI </h5>

![Screenshot](/assets/sharing.png)

Perplexideez allows you to share links to others with the results of your searches. This way, you can send the interesting stuff to your friends easily.

<h5 id="features-sharing-accessControl"> Access control </h5>

![Screenshot](/assets/access-control.png)

When sharing a link, you can make sure only the people you want have access to it. Reroll the link's ID, require authentication to view, or disable it altogether.

<h5 id="features-sharing-embeds"> Good looking embeds </h5>

![Screenshot](/assets/embed.png)

Perplexideez creates beautiful embeds for all the links you share publicly. This way, the people you send it to know what they'll be looking at.

<h4 id="features-deployment"> Deployment </h4>

<h5 id="features-deployment-security"> Security </h5>

All of the containers provided by this project run as non-root by default. They're ready to be deployed in rootless environments.

<h5 id="features-deployment-statelessness"> Statelessness </h5>

Save for an in-progress generation, the containers are fully stateless. The feature that blocks exiting while a response is generated is still a work in progress, but they're ready to run in a Kubernetes environment without concern about rolling updates or higher numbers of replicas screwing things up.

<h2 id="deploying"> Deploying </h2>

<h3 id="deploying-images"> Container images </h3>

- [`ghcr.io/brunostjohn/perplexideez/migrate`](https://github.com/brunostjohn/perplexideez/pkgs/container/perplexideez%2Fmigrate) performs required database migrations and prepares your Postgres instance to be used with Perplexideez. The only environment variable it requires is `DATABASE_URL`.
- [`ghcr.io/brunostjohn/perplexideez/app`](https://github.com/brunostjohn/perplexideez/pkgs/container/perplexideez%2Fapp) is the app itself. It requires the full environment variables mentioned below.

<h3 id="deploying-docker"> Docker </h3>

Use the example Compose files in [`deploy/docker`](https://github.com/brunostjohn/perplexideez/tree/main/deploy/docker) to configure your own stack. These include the app, SearXNG, and a database. Use the `.env.example` to get started, before running rename to `.env` and make sure all the required values from the table below are filled out. The example stack **does not** provide neither Ollama nor OpenAI compatible endpoints. Setting that up is up to you.

<h3 id="deploying-kube"> Kubernetes </h3>

I am still working on the Helm chart for this app. Writing Helm charts is quite the process so I'm procrastinating it. For now, please use [my homelab Kubernetes manifests as an example for how to write your own to deploy this on your cluster](https://github.com/brunostjohn/homelab/tree/main/k8s/productivity/perplexideez).

<h3 id="deploying-metal"> Bare Metal </h3>

Due to a lack of control over these environments and high variance between them, deploying without using container images is unsupported and such issues will go closed due to being out of scope.

<h3 id="deploying-notes"> General notes about dependencies </h3>

<h4 id="deploying-notes-searxng"> SearXNG </h4>

- In my testing, it's very likely that Perplexideez will trigger SearXNG's limiter. Therefore, unless someone finds a better solution, it's better left disabled.
- All requests to SearXNG _will_ fail unless **JSON output is enabled**. This is important, so please remember to adjust your configuration.

<h3 id="deploying-env"> Environment Variables </h3>

<h4 id="deploying-env-data"> Data Storage </h4>

| Name | Required | Value | Example |
| ---- | -------- | ----- | ------- |
| `DATABASE_URL` | ✅ | An URL to a Postgres database. | `postgresql://postgres:postgres@localhost:5432/postgres?schema=public` |

<h4 id="deploying-env-app"> App Setup </h4>

| Name | Required | Value | Example |
| ---- | -------- | ----- | ------- |
| `PUBLIC_BASE_URL` | ✅ | The public-facing URL to your instance. | `https://perplexideez.domain.com` 
| `RATE_LIMIT_SECRET` | ✅ | A secret generated with `openssl rand -base64 32` to be used for securing your sign in page. | N/A |
| `AUTH_SECRET` | ✅ | A secret generated with `openssl rand -base64 32` to be used for securing your instance. | N/A |
| `DISABLE_SIGN_UP` | ❌ (default: `false`) | Whether or not to disable signing up to your instance. | `true`/`false`
| `LOG_LEVEL` | ❌ (default: `info`) | Which log level the app should use. | `trace`/`debug`/`info`/`warn`/`error` |
| `LOG_MODE` | ❌ (default: `json`) | Whether to pretty print logs or use JSON logging. | `pretty`/`json` |
| `METRICS_PORT` | ❌ (default: `9001`) | The port on which Prometheus metrics will be exposed. | `9001` |
| `SKIP_CSRF_CHECK` | ❌ (default: `false`) | Makes the app skip CSRF checks. You most likely don't need this. Only set this if you know what you're doing. | `true`/`false` |
| `USE_SECURE_COOKIES` | ❌ (default: `true`) | Make the app use secure cookies (only transferred over https). Only set this if you're not exposing your app. | `true`/`false` |

<h4 id="deploying-env-sso"> SSO </h4>

| Name | Required | Value | Example |
| ---- | -------- | ----- | ------- |
| `OIDC_CLIENT_ID` | ❌ | The client ID for your IDP. | N/A |
| `OIDC_CLIENT_SECRET` | ❌ | The client secret for your IDP. | N/A |
| `OIDC_ISSUER` | ❌ | The `.well-known` URL for you IDP. | `https://auth.authentik.com/application/o/perplexideez/.well-known/openid-configuration` |
| `OIDC_SCOPES` | ❌ (default: `openid email profile`) | The OIDC scopes to request from your IDP. | `openid email profile` |
| `PUBLIC_OIDC_NAME` | ❌ | The identity provider name to show in the app's UI. | `Zefir's Cloud` |
| `DISABLE_PASSWORD_LOGIN` | ❌ (default: false) | Whether or not to disable password authentication and hide it from the UI. | `true`/`false` |

<h4 id="deploying-env-sso-notes"> SSO notes </h4>

- The redirect URL for this app is `https://perplexideez.yourdomain.com/auth/callback/generic-oauth`.

<h4 id="deploying-env-searxng"> SearXNG </h4>

| Name | Required | Value | Example |
| ---- | -------- | ----- | ------- |
| `SEARXNG_URL` | ✅ | The URL for your SearXNG instance. | `http://searxng:8080` |

<h4 id="deploying-env-ai"> AI Setup </h4>

| Name | Required | Value | Example |
| ---- | -------- | ----- | ------- |
| `LLM_MODE` | ✅ | `ollama` | Which LLM provider to use. | `ollama`/`openai` |
| `LLM_SPEED_MODEL` | ✅ | The LLM to use for generating responses in "Speed" mode. | `gemma2:2b` |
| `LLM_BALANCED_MODEL` | ✅ | The LLM to use for generating responses in "Balanced" mode. | `llama3.1:latest` |
| `LLM_QUALITY_MODEL` | ✅ | The LLM to use for generating responses in "Quality" mode. | `qwen2.5:32b` |
| `LLM_EMBEDDINGS_MODEL` | ✅ | The LLM to use for text embeddings. | `nomic-embed-text:latest` |
| `LLM_TITLE_MODEL` | ✅ | The LLM to use for generating chat titles. | `llama3.1:latest` |
| `LLM_EMOJI_MODEL` | ✅ | The LLM to use for generating chat emojis. | `llama3.1:latest` |
| `LLM_IMAGE_SEARCH_MODEL` | ✅ | The LLM to use for image searching. | `llama3.1:latest` |
| `LLM_VIDEO_SEARCH_MODEL` | ✅ | The LLM to use for video searching. | `llama3.1:latest` |

<h5 id="deploying-env-ai-openai"> OpenAI </h5>

Required only if `LLM_MODE` is set to `openai`.

| Name | Required | Value | Example |
| ---- | -------- | ----- | ------- |
| `OPENAI_BASE_URL` | ✅ | The base URL to your OpenAI compatible endpoints. | `https://chat.domain.com/v1` |
| `OPENAI_API_KEY` | ✅ | The API key to use for requests. | `sk-1234` |

<h5 id="deploying-env-ai-ollama"> Ollama </h5>

Required only if `LLM_MODE` is set to `ollama`.

| Name | Required | Value | Example |
| ---- | -------- | ----- | ------- |
| `OLLAMA_URL` | ✅ | The URL for your Ollama instance. | `http://ollama:11434` |


<h2 id="builtWith"> Built With </h2>

- [SvelteKit](https://svelte.dev)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn Svelte](https://www.shadcn-svelte.com/)
- [tRPC](https://trpc.io/)
- [Prisma](https://www.prisma.io/)
- [AuthJS](https://authjs.dev/)
- [TanStack Query](https://tanstack.com/query)
- [Docker](https://docker.com/)
- [Kubernetes](https://kubernetes.io)
- [Langchain](https://langchain.com)

<h2 id="developingLocally"> Developing Locally </h2>

To get a local copy up and running follow these simple example steps.

<h3 id="developingLocally-pre"> Prerequisites </h3>

You need either an OpenAI API token/OpenAI compatible API or an Ollama instance running somewhere. The development container setup only provides Postgres and SearXNG.

- pnpm
  ```sh
  corepack install pnpm
  ```

<h3 id="developingLocally-install"> Installation </h3>

1. Clone the repo
   ```sh
   git clone https://github.com/brunostjohn/perplexideez.git
   ```
2. Install packages
   ```sh
   pnpm install
   ```
3. Create a `.env` file using the `.env.example`
4. Start the development environment
   ```sh
   pnpm dev:up
   ```
5. Update the database schema
   ```sh
   pnpm db:push
   ```
6. Run the app
   ```sh
   pnpm dev
   ```

<h2 id="roadmap"> Roadmap </h2>

- [x] Fully support web searching
- [x] Shareable no-authentication links
- [ ] Full statelessness
  - [ ] Block exiting while generating, just in case
  - [ ] Use Redis to persist internal generation state
- [ ] View & explore image/video suggestions.
- [ ] Favourites on the sidebar
- [ ] Ensure deployments work
  - [ ] Complete Helm chart for Kubernetes deployment
- [ ] More agents
  - [ ] Web agents
  - [ ] Self-hosted app agents

See the [open issues](https://github.com/brunostjohn/perplexideez/issues) for a full list of proposed features (and known issues).

<h2 id="contributing"> Contributing </h2>

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<h2 id="license"> License </h2>

Distributed under the AGPL License.

<h2 id="contact"> Contact </h2>

Bruno St John - me@brunostjohn.com

<h2 id="acknowledgments"> Acknowledgments </h2>

- [The Perplexica team](https://github.com/ItzCrazyKns/Perplexica) for implementing the basis for a self-hosted search AI agent.
