# Contentful MCP server via Docker (stdio transport for Cursor/other MCP clients)
# Build: docker build -t contentful-mcp -f docker/contentful-mcp/Dockerfile docker/contentful-mcp
# Run (stdio): docker run -i --rm -e CONTENTFUL_MANAGEMENT_ACCESS_TOKEN -e SPACE_ID -e ENVIRONMENT_ID contentful-mcp
FROM node:20-alpine

ENV CONTENTFUL_HOST=api.contentful.com
ENV ENVIRONMENT_ID=master

# MCP clients (Cursor, etc.) talk over stdio; npx fetches @contentful/mcp-server at run
ENTRYPOINT ["npx", "-y", "@contentful/mcp-server"]
