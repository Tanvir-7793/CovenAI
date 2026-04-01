declare module 'froala-editor/js/plugins.pkgd.min' {
  const content: any;
  export default content;
}

declare module 'froala-editor' {
  import { ComponentType } from 'react';
  
  interface FroalaEditorProps {
    tag?: string;
    model?: string;
    onModelChange?: (model: string) => void;
    config?: {
      placeholderText?: string;
      heightMin?: number;
      heightMax?: number | string;
      toolbarSticky?: boolean;
      toolbarStickyOffset?: number;
      toolbarVisibleWithoutSelection?: boolean;
      quickInsertEnabled?: boolean;
      attribution?: boolean;
      toolbarButtons?: {
        moreText?: {
          buttons: string[];
        };
        moreParagraph?: {
          buttons: string[];
        };
        moreRich?: {
          buttons: string[];
        };
        moreMisc?: {
          buttons: string[];
          align?: string;
          buttonsVisible?: number;
        };
      };
    };
  }

  const FroalaEditor: ComponentType<FroalaEditorProps>;
  export default FroalaEditor;
}
