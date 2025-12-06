import { Button } from '@/components/ui/button';
import { Brain, Loader2, Send, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface BrainDumpInputProps {
    onSubmit: (text: string) => Promise<void>;
    isClassifying: boolean;
}

const placeholderExamples = [
    'Pay the electricity bill before 5 PM today...',
    'Schedule a meeting with the design team...',
    'Learn to play guitar someday...',
    'Call mom - she called twice...',
    'Review quarterly report before Friday...',
    'Clean up the garage this weekend...',
];

export function BrainDumpInput({
    onSubmit,
    isClassifying,
}: BrainDumpInputProps) {
    const [input, setInput] = useState('');
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex(
                (prev) => (prev + 1) % placeholderExamples.length,
            );
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async () => {
        if (!input.trim() || isClassifying) return;
        await onSubmit(input.trim());
        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    return (
        <div className="relative mx-auto w-full max-w-3xl">
            {/* Glowing background effect */}
            <div
                className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-accent to-neon-magenta opacity-20 blur-xl transition-opacity duration-500 ${
                    isFocused ? 'opacity-40' : 'opacity-20'
                }`}
            />

            {/* Main container */}
            <div
                className={`glass dark:glass relative rounded-2xl p-1 transition-all duration-300 ${
                    isFocused ? 'glow-cyan' : ''
                }`}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 p-2">
                            <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="gradient-text text-sm font-semibold">
                                User Prompt
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Enter your task here
                            </p>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-accent" />
                        <span>AI-Powered</span>
                    </div>
                </div>

                {/* Input area */}
                <div className="relative px-4 pb-4">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={placeholderExamples[placeholderIndex]}
                            disabled={isClassifying}
                            rows={1}
                            className="max-h-[200px] min-h-[60px] w-full resize-none rounded-xl border border-border/50 bg-background/50 px-4 py-3 pr-14 text-foreground transition-all duration-300 outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-background/30"
                        />

                        {/* Submit button */}
                        <Button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isClassifying}
                            size="icon"
                            className="absolute right-2 bottom-2 h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-accent/90 disabled:opacity-50"
                        >
                            {isClassifying ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {/* Classification indicator */}
                    {isClassifying && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="flex gap-1">
                                <span
                                    className="h-2 w-2 animate-bounce rounded-full bg-primary"
                                    style={{ animationDelay: '0ms' }}
                                />
                                <span
                                    className="h-2 w-2 animate-bounce rounded-full bg-accent"
                                    style={{ animationDelay: '150ms' }}
                                />
                                <span
                                    className="h-2 w-2 animate-bounce rounded-full bg-neon-magenta"
                                    style={{ animationDelay: '300ms' }}
                                />
                            </div>
                            <span>AI is analyzing your task...</span>
                        </div>
                    )}

                    {/* Hint */}
                    <p className="mt-2 text-center text-xs text-muted-foreground/70">
                        Press{' '}
                        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
                            Enter
                        </kbd>{' '}
                        to submit •{' '}
                        <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">
                            Shift+Enter
                        </kbd>{' '}
                        for new line
                    </p>
                </div>
            </div>
        </div>
    );
}
