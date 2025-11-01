// Froala Editor configuration
export const froalaConfig = {
  // Set the license key if you have one
  // key: 'YOUR_LICENSE_KEY',
  
  // Disable the file upload functionality (you can enable it later if needed)
  fileUpload: false,
  
  // Disable the image upload functionality (you can enable it later if needed)
  imageUpload: false,
  
  // Disable the video upload functionality
  videoUpload: false,
  
  // Disable the file manager
  fileManager: false,
  
  // Disable the image manager
  imageManager: false,
  
  // Disable the video manager
  videoManager: false,
  
  // Set the theme
  theme: 'gray',
  
  // Set the height
  heightMin: 300,
  heightMax: 600,
  
  // Enable toolbar sticky
  toolbarSticky: true,
  
  // Set the placeholder text
  placeholderText: 'Start typing your document here or generate one using the form above...',
  
  // Configure the toolbar buttons
  toolbarButtons: {
    moreText: {
      buttons: [
        'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 
        'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting'
      ],
      buttonsVisible: 6
    },
    moreParagraph: {
      buttons: [
        'alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 
        'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 
        'outdent', 'indent', 'quote'
      ],
      buttonsVisible: 4
    },
    moreRich: {
      buttons: [
        'insertLink', 'insertTable', 'emoticons', 'specialCharacters', 
        'insertHR', 'selectAll', 'getPDF', 'spellChecker', 'help', 'html'
      ],
      buttonsVisible: 5
    },
    moreMisc: {
      buttons: [
        'undo', 'redo', 'fullscreen', 'print', 'getPDF', 
        'spellChecker', 'selectAll', 'html', 'help'
      ],
      align: 'right',
      buttonsVisible: 3
    }
  },
  
  // Disable quick insert
  quickInsertEnabled: false,
  
  // Enable the char counter
  charCounterCount: true,
  
  // Set the maximum number of characters
  charCounterMax: 10000,
  
  // Enable the paste plugin
  pastePlain: true,
  
  // Enable the spellchecker
  spellcheck: true,
  
  // Enable the image edit buttons
  imageEditButtons: ['imageReplace', 'imageAlign', 'imageRemove', '|', 'imageLink', 'linkOpen', 'linkEdit', 'linkRemove', '-', 'imageDisplay', 'imageStyle', 'imageAlt', 'imageSize'],
  
  // Events
  events: {
    'froalaEditor.initialized': function() {
      console.log('Froala Editor has been initialized');
    },
    'froalaEditor.contentChanged': function() {
      console.log('Content was changed');
    }
  }
};

// Export the config as default
export default froalaConfig;
