import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit2, Tag, DollarSign } from 'lucide-react';

interface InlineEditTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const InlineEditText: React.FC<InlineEditTextProps> = ({ 
  value, 
  onSave, 
  className = '',
  placeholder = 'Enter value...'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className="px-2 py-1 bg-chronos-950 border border-chronos-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-chronos-500 w-full min-w-[150px]"
        />
        <button 
          onClick={handleSave}
          className="p-1 hover:bg-green-500/20 rounded text-green-400"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleCancel}
          className="p-1 hover:bg-red-500/20 rounded text-red-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group cursor-pointer flex items-center gap-2 ${className}`}
      title="Double-click to edit"
    >
      <span className="truncate">{value}</span>
      <Edit2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};

interface InlineEditNumberProps {
  value: number;
  onSave: (value: number) => void;
  prefix?: string;
  suffix?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const InlineEditNumber: React.FC<InlineEditNumberProps> = ({ 
  value, 
  onSave, 
  prefix = '',
  suffix = '',
  className = '',
  min,
  max,
  step = 1
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue !== value) {
      const clampedValue = Math.min(Math.max(numValue, min ?? -Infinity), max ?? Infinity);
      onSave(clampedValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <div className="relative">
          {prefix && (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>
          )}
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            min={min}
            max={max}
            step={step}
            className={`px-2 py-1 bg-chronos-950 border border-chronos-600 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-chronos-500 w-28 ${prefix ? 'pl-5' : ''}`}
          />
        </div>
        <button 
          onClick={handleSave}
          className="p-1 hover:bg-green-500/20 rounded text-green-400"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={handleCancel}
          className="p-1 hover:bg-red-500/20 rounded text-red-400"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group cursor-pointer flex items-center gap-1 ${className}`}
      title="Double-click to edit"
    >
      <span>{prefix}{value.toLocaleString()}{suffix}</span>
      <Edit2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};

interface InlineEditTagsProps {
  tags: string[];
  onSave: (tags: string[]) => void;
  suggestedTags?: string[];
  className?: string;
}

export const InlineEditTags: React.FC<InlineEditTagsProps> = ({ 
  tags, 
  onSave,
  suggestedTags = ['High Priority', 'Scaling', 'Testing', 'Seasonal', 'Retargeting', 'Prospecting'],
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>(tags);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, editTags]);

  const handleSave = () => {
    if (JSON.stringify(editTags) !== JSON.stringify(tags)) {
      onSave(editTags);
    }
    setIsEditing(false);
    setInputValue('');
    setShowSuggestions(false);
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !editTags.includes(trimmedTag)) {
      setEditTags([...editTags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    setEditTags(editTags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && editTags.length > 0) {
      removeTag(editTags[editTags.length - 1]);
    } else if (e.key === 'Escape') {
      setEditTags(tags);
      setIsEditing(false);
      setInputValue('');
    }
  };

  const filteredSuggestions = suggestedTags.filter(
    s => !editTags.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
  );

  if (isEditing) {
    return (
      <div ref={containerRef} className="relative" onClick={e => e.stopPropagation()}>
        <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-chronos-950 border border-chronos-600 rounded min-w-[200px]">
          {editTags.map(tag => (
            <span 
              key={tag} 
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-chronos-700 text-xs text-white rounded"
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={editTags.length === 0 ? "Add tags..." : ""}
            className="flex-1 min-w-[80px] bg-transparent text-sm text-white focus:outline-none placeholder-gray-500"
          />
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-full bg-chronos-900 border border-chronos-700 rounded-lg shadow-xl z-20 overflow-hidden">
            {filteredSuggestions.slice(0, 5).map(suggestion => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-chronos-800 hover:text-white transition-colors"
              >
                <Tag className="w-3 h-3 inline-block mr-2 text-gray-500" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex justify-end mt-2 gap-1">
          <button 
            onClick={handleSave}
            className="px-2 py-1 text-xs bg-chronos-500 text-white rounded hover:bg-chronos-600"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group cursor-pointer flex items-center gap-1 ${className}`}
      title="Double-click to edit tags"
    >
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-chronos-800 text-xs text-gray-300 rounded">
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-gray-600 text-sm flex items-center gap-1">
          <Tag className="w-3 h-3" />
          Add tags
        </span>
      )}
      <Edit2 className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};
