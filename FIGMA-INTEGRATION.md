# Figma Integration for Routinize Fitness App

This project is configured to work with the Figma Developer extension for VS Code, allowing you to access Figma designs directly from your code editor.

## Setup

1. The project is already configured with the necessary settings in `.vscode/settings.json` and `.vscode/extensions.json`.

2. Install the Figma Developer extension for VS Code:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Figma Developer"
   - Install the extension by Figma

3. The Figma API key is already configured in the project settings.

## Using the Figma Integration

### Accessing Figma Designs

1. Open the Figma panel in VS Code by clicking on the Figma icon in the activity bar.
2. You can browse your Figma files and components directly from VS Code.
3. Use the search functionality to find specific components or frames.

### Importing Components

1. Select a component or frame in the Figma panel.
2. Right-click and select "Copy as JSX" or "Copy as HTML" depending on your needs.
3. Paste the code into your React component.

### Viewing Design Specs

1. Select a component or frame in the Figma panel.
2. The properties panel will show you design specs like colors, spacing, and typography.
3. You can copy these values to use in your CSS or Tailwind classes.

## Troubleshooting

If you encounter any issues with the Figma integration:

1. Make sure the Figma Developer extension is installed and enabled.
2. Check that VS Code has the correct permissions to access the Figma API.
3. Try restarting VS Code.
4. If problems persist, you may need to regenerate the Figma API key.

## Additional Resources

- [Figma Developer Extension Documentation](https://www.figma.com/developers/api)
- [Figma Developer MCP GitHub Repository](https://github.com/figma/figma-developer-mcp)
