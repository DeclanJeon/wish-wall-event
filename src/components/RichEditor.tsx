import React, { useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

const RichEditor: React.FC<RichEditorProps> = ({
  value,
  onChange,
  placeholder = "메시지를 입력하세요...",
  maxLength = 10000,
  className = ""
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align', 'link'
  ];

  const handleChange = (content: string) => {
    // Remove HTML tags to count actual text length
    const textLength = content.replace(/<[^>]*>/g, '').length;
    if (textLength <= maxLength) {
      onChange(content);
    }
  };

  const getTextLength = () => {
    const textLength = value.replace(/<[^>]*>/g, '').length;
    return textLength;
  };

  return (
    <div className={`rich-editor-container ${className}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="min-h-[120px]"
      />
      <div className="text-xs text-muted-foreground mt-2 text-right">
        {getTextLength()}/{maxLength}자
      </div>
    </div>
  );
};

export default RichEditor;