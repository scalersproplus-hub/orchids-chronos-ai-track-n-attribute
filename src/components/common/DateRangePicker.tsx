import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

type DateRange = {
    start: Date | null;
    end: Date | null;
};

type PresetRange = {
    label: string;
    getValue: () => DateRange;
};

interface DateRangePickerProps {
    value: DateRange;
    onChange: (range: DateRange) => void;
    className?: string;
}

const PRESET_RANGES: PresetRange[] = [
    {
        label: 'Today',
        getValue: () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return { start: today, end: new Date() };
        }
    },
    {
        label: 'Yesterday',
        getValue: () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const end = new Date(yesterday);
            end.setHours(23, 59, 59, 999);
            return { start: yesterday, end };
        }
    },
    {
        label: 'Last 7 days',
        getValue: () => {
            const start = new Date();
            start.setDate(start.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            return { start, end: new Date() };
        }
    },
    {
        label: 'Last 30 days',
        getValue: () => {
            const start = new Date();
            start.setDate(start.getDate() - 30);
            start.setHours(0, 0, 0, 0);
            return { start, end: new Date() };
        }
    },
    {
        label: 'Last 90 days',
        getValue: () => {
            const start = new Date();
            start.setDate(start.getDate() - 90);
            start.setHours(0, 0, 0, 0);
            return { start, end: new Date() };
        }
    },
    {
        label: 'This month',
        getValue: () => {
            const start = new Date();
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            return { start, end: new Date() };
        }
    },
    {
        label: 'Last month',
        getValue: () => {
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setMonth(end.getMonth() + 1);
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
            return { start, end };
        }
    },
];

const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateShort = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getMonthDays = (year: number, month: number): (Date | null)[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
    }
    
    return days;
};

const isSameDay = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
};

const isInRange = (date: Date, start: Date | null, end: Date | null): boolean => {
    if (!start || !end) return false;
    return date >= start && date <= end;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMonth, setViewMonth] = useState(new Date());
    const [selectingEnd, setSelectingEnd] = useState(false);
    const [tempRange, setTempRange] = useState<DateRange>(value);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset temp range when opening
    useEffect(() => {
        if (isOpen) {
            setTempRange(value);
            setSelectingEnd(false);
        }
    }, [isOpen, value]);

    const handleDayClick = (date: Date) => {
        if (!selectingEnd) {
            setTempRange({ start: date, end: null });
            setSelectingEnd(true);
        } else {
            if (date < (tempRange.start || new Date())) {
                setTempRange({ start: date, end: tempRange.start });
            } else {
                setTempRange({ ...tempRange, end: date });
            }
            // Apply the range
            setTimeout(() => {
                if (date < (tempRange.start || new Date())) {
                    onChange({ start: date, end: tempRange.start });
                } else {
                    onChange({ start: tempRange.start, end: date });
                }
                setIsOpen(false);
            }, 150);
        }
    };

    const handlePresetClick = (preset: PresetRange) => {
        const range = preset.getValue();
        onChange(range);
        setIsOpen(false);
    };

    const navigateMonth = (delta: number) => {
        setViewMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    const days = getMonthDays(viewMonth.getFullYear(), viewMonth.getMonth());
    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const displayValue = value.start && value.end
        ? `${formatDateShort(value.start)} - ${formatDateShort(value.end)}`
        : value.start 
        ? formatDate(value.start)
        : 'Select dates';

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-chronos-900 border border-chronos-800 rounded-lg text-sm text-gray-300 hover:border-chronos-600 hover:text-white transition-all"
            >
                <Calendar className="w-4 h-4" />
                <span>{displayValue}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-chronos-900 border border-chronos-800 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 flex overflow-hidden">
                    {/* Presets */}
                    <div className="w-36 border-r border-chronos-800 p-2">
                        <div className="text-xs text-gray-500 font-semibold px-2 py-1 mb-1">Quick Select</div>
                        {PRESET_RANGES.map(preset => (
                            <button
                                key={preset.label}
                                onClick={() => handlePresetClick(preset)}
                                className="w-full px-2 py-1.5 text-left text-sm text-gray-400 hover:bg-chronos-800 hover:text-white rounded transition-colors"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {/* Calendar */}
                    <div className="p-4">
                        {/* Month Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="p-1 hover:bg-chronos-800 rounded transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                            </button>
                            <span className="text-sm font-medium text-white">
                                {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="p-1 hover:bg-chronos-800 rounded transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>

                        {/* Week Days Header */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map(day => (
                                <div key={day} className="w-8 h-8 flex items-center justify-center text-xs text-gray-500">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((date, i) => {
                                if (!date) {
                                    return <div key={i} className="w-8 h-8" />;
                                }
                                
                                const isStart = isSameDay(date, tempRange.start);
                                const isEnd = isSameDay(date, tempRange.end);
                                const inRange = isInRange(date, tempRange.start, tempRange.end);
                                const isToday = isSameDay(date, new Date());
                                
                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleDayClick(date)}
                                        className={`w-8 h-8 flex items-center justify-center text-xs rounded transition-colors ${
                                            isStart || isEnd
                                                ? 'bg-chronos-500 text-white'
                                                : inRange
                                                ? 'bg-chronos-500/20 text-chronos-300'
                                                : isToday
                                                ? 'border border-chronos-500 text-chronos-400'
                                                : 'text-gray-400 hover:bg-chronos-800 hover:text-white'
                                        }`}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Hint */}
                        <div className="mt-3 text-xs text-gray-500 text-center">
                            {!selectingEnd ? 'Select start date' : 'Select end date'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
