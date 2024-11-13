<br/>
<div align="center">
<a href="assets/icon-frameless.png">
<img src="assets/icon-frameless.png" alt="Logo" width="100" height="100">
</a>
<h3 align="center">Perplexideez</h3>
<p align="center">
Self-hosted AI-powered search.
<!-- <br/>
<br/> -->
<!-- <a href="https://github.com/ShaanCoding/ReadME-Generator/issues/new?labels=bug&template=bug-report---.md">Report Bug</a> ·
<a href="https://github.com/ShaanCoding/ReadME-Generator/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a> -->
</p>
</div>

## About The Project

![Screenshot](/assets/browser.png)

There are many self-hosted Perplexity clones out there. I chose to make my own as I was dissatisfied with their non-existent integration with other self-hosted services and lack of multi-user support. Perplexideez is backed by a Postgres database & either Ollama or OpenAI compatible endpoints. It searches the web using a SearXNG instance.

## Deploying

Currently this project is under heavy development and there is no deployment support available. Please wait until it's ready. Thanks!

### Built With

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

## Developing Locally

To get a local copy up and running follow these simple example steps.

### Prerequisites

You need either an OpenAI API token/OpenAI compatible API or an Ollama instance running somewhere. The development container setup only provides Postgres and SearXNG.

- pnpm
  ```sh
  corepack install pnpm
  ```

### Installation

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

## Roadmap

- [ ] Fully support web searching
- [ ] Shareable no-authentication links
- [ ] Favourites on the sidebar
- [ ] Ensure deployments work
  - [ ] Complete Helm chart for Kubernetes deployment
- [ ] More agents
  - [ ] Web agents
  - [ ] Self-hosted app agents

See the [open issues](https://github.com/brunostjohn/perplexideez/issues) for a full list of proposed features (and known issues).

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the AGPL License.

## Contact

Bruno St John - me@brunostjohn.com

## Acknowledgments

- [The Perplexica team](https://github.com/ItzCrazyKns/Perplexica) for implementing the basis for a self-hosted search AI agent.
