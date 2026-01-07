
import { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

interface CodeLine {
  text: string;
  delay: number;
  type: 'import' | 'class' | 'method' | 'comment' | 'log' | 'success' | 'error';
}

const CODE_SEQUENCES: CodeLine[] = [
  { text: "// Analyzing project requirements...", delay: 100, type: 'comment' },
  { text: "import 'package:flutter/material.dart';", delay: 80, type: 'import' },
  { text: "import 'package:flutter/services.dart';", delay: 60, type: 'import' },
  { text: "", delay: 200, type: 'log' },
  { text: "class AppBuilder {", delay: 100, type: 'class' },
  { text: "  static Widget buildUI(String prompt) {", delay: 120, type: 'method' },
  { text: "    // Generating component structure", delay: 150, type: 'comment' },
  { text: "    return MaterialApp(", delay: 90, type: 'class' },
  { text: "      theme: ThemeData.from(", delay: 80, type: 'class' },
  { text: "        colorScheme: ColorScheme.fromSeed(", delay: 70, type: 'class' },
  { text: "          seedColor: Colors.deepPurple,", delay: 60, type: 'class' },
  { text: "        ),", delay: 40, type: 'class' },
  { text: "      ),", delay: 50, type: 'class' },
  { text: "      home: Scaffold(", delay: 80, type: 'class' },
  { text: "        appBar: AppBar(", delay: 70, type: 'class' },
  { text: "          title: Text('AI Generated App'),", delay: 90, type: 'class' },
  { text: "        ),", delay: 40, type: 'class' },
  { text: "        body: buildContent(),", delay: 100, type: 'method' },
  { text: "      ),", delay: 50, type: 'class' },
  { text: "    );", delay: 60, type: 'class' },
  { text: "  }", delay: 80, type: 'class' },
  { text: "}", delay: 100, type: 'class' },
  { text: "", delay: 300, type: 'log' },
  { text: "[SUCCESS] Widget tree generated", delay: 120, type: 'success' },
  { text: "[INFO] Optimizing performance...", delay: 100, type: 'log' },
  { text: "[SUCCESS] Build completed successfully", delay: 150, type: 'success' }
];

interface CodeTypingAnimationProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const CodeTypingAnimation = ({ isActive, onComplete }: CodeTypingAnimationProps) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, [isActive]);

  useEffect(() => {
    if (!isActive || currentLineIndex >= CODE_SEQUENCES.length) {
      if (currentLineIndex >= CODE_SEQUENCES.length && onComplete) {
        setTimeout(onComplete, 1000);
      }
      return;
    }

    const currentLine = CODE_SEQUENCES[currentLineIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex <= currentLine.text.length) {
        setCurrentText(currentLine.text.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        
        setTimeout(() => {
          setDisplayedLines(prev => [...prev, currentLine.text]);
          setCurrentText('');
          setCurrentLineIndex(prev => prev + 1);
        }, 300);
      }
    }, currentLine.delay);

    return () => clearInterval(typeInterval);
  }, [currentLineIndex, isActive, onComplete]);

  const getLineColor = (line: string) => {
    if (line.startsWith('//')) return 'text-green-400';
    if (line.startsWith('import')) return 'text-blue-400';
    if (line.includes('class ') || line.includes('Widget ')) return 'text-purple-400';
    if (line.startsWith('[SUCCESS]')) return 'text-green-400';
    if (line.startsWith('[ERROR]')) return 'text-red-400';
    if (line.startsWith('[INFO]')) return 'text-yellow-400';
    return 'text-gray-300';
  };

  if (!isActive) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-slate-900 rounded-lg border border-slate-700 shadow-2xl">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800 rounded-t-lg">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Terminal className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400 font-mono">flutter_builder.dart</span>
          </div>
        </div>
        
        <div className="p-6 font-mono text-sm min-h-96 max-h-96 overflow-y-auto">
          {displayedLines.map((line, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500 text-xs mr-4 select-none">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className={getLineColor(line)}>{line || ' '}</span>
            </div>
          ))}
          
          {currentText && (
            <div className="mb-1">
              <span className="text-gray-500 text-xs mr-4 select-none">
                {String(displayedLines.length + 1).padStart(2, '0')}
              </span>
              <span className={getLineColor(currentText)}>
                {currentText}
                {showCursor && <span className="bg-gray-300 text-slate-900 ml-0.5">▋</span>}
              </span>
            </div>
          )}
          
          {!currentText && currentLineIndex < CODE_SEQUENCES.length && (
            <div className="mb-1">
              <span className="text-gray-500 text-xs mr-4 select-none">
                {String(displayedLines.length + 1).padStart(2, '0')}
              </span>
              {showCursor && <span className="bg-gray-300 text-slate-900">▋</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
