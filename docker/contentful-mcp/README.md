# Contentful MCP via Docker

Run the [Contentful MCP server](https://www.contentful.com/developers/docs/tools/mcp-server/) inside Docker so Cursor (or another MCP client) can use it without installing Node/npx locally.

## Build

From the repo root:

```bash
docker build -t contentful-mcp -f docker/contentful-mcp/Dockerfile docker/contentful-mcp
```

## Run (stdio, for Cursor)

Environment variables are passed into the container. Set them in your shell or in a `.env` file that Cursor loads:

- `CONTENTFUL_MANAGEMENT_ACCESS_TOKEN` – Contentful Management API personal access token
- `SPACE_ID` – Contentful space ID (e.g. `zq9l8zsrgrh3`)
- `ENVIRONMENT_ID` – optional, defaults to `master` in the image
- `CONTENTFUL_HOST` – optional, defaults to `api.contentful.com`

Manual run (to test):

```bash
export CONTENTFUL_MANAGEMENT_ACCESS_TOKEN="your_cma_token"
export SPACE_ID="zq9l8zsrgrh3"
docker run -i --rm \
  -e CONTENTFUL_MANAGEMENT_ACCESS_TOKEN \
  -e SPACE_ID \
  -e ENVIRONMENT_ID=master \
  contentful-mcp
```

## Configure Cursor to use Contentful MCP via Docker

Add this server to your Cursor MCP config.

**Option A – User config** (`~/.cursor/mcp.json`): merge the `contentful-docker` entry into your existing `mcpServers`:

```json
{
  "mcpServers": {
    "contentful-docker": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e", "CONTENTFUL_MANAGEMENT_ACCESS_TOKEN",
        "-e", "SPACE_ID",
        "-e", "ENVIRONMENT_ID",
        "-e", "CONTENTFUL_HOST",
        "contentful-mcp"
      ]
    }
  }
}
```

**Option B – Project config**: if your project uses a project-level MCP file (e.g. `.cursor/mcp.json`), add the same `contentful-docker` entry there.

Ensure Cursor sees the env vars (e.g. export them in your shell before starting Cursor, or use a `.env` in the project root if your setup loads it). Cursor will pass them to the `docker` process, and `-e VAR` forwards them into the container.

After rebuilding the image and updating config, restart Cursor (or reload MCP) so it picks up the Contentful server. You can then use Contentful MCP tools (e.g. `get_content_type`, `update_content_type`, `get_entry`) from the agent.
