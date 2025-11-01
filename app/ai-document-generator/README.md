# AI Document Generator

A modern, AI-powered document generation tool that helps users create legal documents quickly and easily. This feature integrates with the Froala rich text editor for a seamless document editing experience.

## Features

- **Multiple Document Types**: Generate various legal documents including contracts, NDAs, terms of service, and privacy policies.
- **Rich Text Editor**: Powerful WYSIWYG editor with formatting options, lists, tables, and more.
- **Preview Mode**: Toggle between edit and preview modes to see how your document will look.
- **Download Documents**: Save your generated documents in various formats.
- **Responsive Design**: Works on desktop and mobile devices.

## How It Works

1. Select a document type from the dropdown menu.
2. Enter a title for your document.
3. Click "Generate Document" to create a template.
4. Edit the content using the rich text editor.
5. Toggle to preview mode to see the final output.
6. Download the document when you're done.

## Integration with AI

This component is designed to work with AI services (like Gemini AI) to generate initial document drafts. The current implementation includes a mock AI service that returns sample content.

To integrate with a real AI service:

1. Update the `handleGenerate` function in `page.tsx` to call your AI service API.
2. Process the response and update the `documentContent` state.
3. Handle any errors and loading states appropriately.

## Dependencies

- React
- Next.js
- Froala Editor (`react-froala-wysiwyg`)
- Tailwind CSS (for styling)

## Configuration

The Froala editor can be configured in `froala-config.js`. You can customize:
- Toolbar buttons and layout
- Editor theme and styling
- Allowed HTML tags and attributes
- File upload settings
- And more...

## License

This project is licensed under the MIT License. Note that Froala Editor requires a commercial license for production use.
