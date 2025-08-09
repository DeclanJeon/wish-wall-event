import { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const RichEditor = ({ value, onChange, placeholder, maxLength = 10000 }: RichEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: false, // 툴바 숨기기
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'align', 'blockquote', 'code-block',
    'list', 'bullet', 'link', 'image'
  ];

  const handleChange = (content: string, delta: any, source: any, editor: any) => {
    const text = editor.getText();
    if (text.length <= maxLength + 1) { // +1 for the newline that Quill adds
      onChange(content);
    }
  };

  // Get character count (excluding HTML tags)
  const getCharacterCount = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      return editor.getText().length - 1; // -1 for the newline that Quill adds
    }
    return 0;
  };

  return (
    <div className="space-y-2">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        className="bg-background"
      />
      {maxLength && (
        <div className="text-sm text-muted-foreground text-right">
          {getCharacterCount()} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default RichEditor;