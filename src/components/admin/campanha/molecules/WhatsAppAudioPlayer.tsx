import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppAudioPlayerProps {
    url: string;
    timestamp?: string;
    avatarUrl?: string;
}

export function WhatsAppAudioPlayer({ url, timestamp = "14:00", avatarUrl }: WhatsAppAudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(url);
        audioRef.current = audio;

        const setAudioData = () => setDuration(audio.duration);
        const setAudioTime = () => setCurrentTime(audio.currentTime);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, [url]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Waveform simulation bars
    const bars = [8, 12, 10, 15, 8, 20, 12, 18, 10, 14, 16, 12, 10, 8, 12, 15, 10, 12, 14, 10, 8, 12, 10, 15, 12, 18, 10, 14, 16, 12, 10, 8];

    return (
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm w-full max-w-[280px]">
            <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                type="button"
            >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>

            <div className="flex-1 flex flex-col gap-1 justify-center relative">
                <div className="flex items-center gap-[2px] h-6 overflow-hidden">
                    {bars.map((height, i) => {
                        const barProgress = (i / bars.length) * 100;
                        const isActive = barProgress <= progress;
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "w-[2px] rounded-full transition-colors duration-200",
                                    isActive ? "bg-sky-400" : "bg-slate-300"
                                )}
                                style={{ height: `${height}px` }}
                            />
                        );
                    })}
                </div>

                {/* Progress Dot Overlay */}
                <div
                    className="absolute left-0 bottom-[10px] w-3 h-3 bg-sky-400 rounded-full border-2 border-white shadow-sm transition-all duration-100 ease-linear pointer-events-none"
                    style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                />

                <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] font-bold text-slate-400">{formatTime(currentTime || 0)}</span>
                    <span className="text-[7px] text-slate-400 font-bold uppercase tracking-tighter">{timestamp}</span>
                </div>
            </div>

            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shadow-sm">
                    <img
                        src={avatarUrl || "https://ui-avatars.com/api/?name=User&background=random"}
                        alt="User"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                    <Mic size={10} className="text-sky-500" fill="currentColor" />
                </div>
            </div>
        </div>
    );
}
