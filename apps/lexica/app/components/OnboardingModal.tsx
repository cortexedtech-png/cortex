'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, Zap, Mic, BookOpen, Trophy, Sprout, Leaf, Sparkles, Flame, User, Briefcase, Laptop, GraduationCap } from 'lucide-react';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useLexicaStore } from '../store/lexicaStore';
import type { UserArchetype } from './VocabCard';

interface OnboardingModalProps {
    onComplete: () => void;
}

const STEPS = [
    {
        icon: Zap,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/15 border-cyan-500/30',
        title: 'Chào mừng đến LEXICA',
        body: 'LEXICA giúp bạn học từ vựng tiếng Anh theo cách tốt nhất: học bằng ngữ cảnh thực tế, ôn tập đúng lúc trước khi quên.',
        detail: 'Mỗi ngày bạn có 30 năng lượng ⚡. Hết năng lượng → nghỉ ngơi → hôm sau học tiếp.',
    },
    {
        icon: User,
        iconColor: 'text-purple-400',
        iconBg: 'bg-purple-500/15 border-purple-500/30',
        title: 'Chọn ngữ cảnh học phù hợp',
        body: 'Bạn muốn học từ vựng trong ngữ cảnh nào? Điều này giúp LEXICA cá nhân hóa các tình huống thực tế phù hợp với cuộc sống của bạn.',
        detail: null,
        isPersonaSelection: true,
    },
    {
        icon: BookOpen,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/15 border-cyan-500/30',
        title: 'Quẹt để học',
        body: 'Mỗi card có một tình huống thực tế. Đọc tình huống, đoán từ và đưa ra quyết định:',
        detail: 'Nếu là từ đang ôn tập, bạn phải trả lời đúng Quiz trên thẻ mới được tính là "Chính xác".',
        cards: [
            { icon: '←', label: 'Bỏ qua / Quên', desc: 'Từ mới (không tốn ⚡) hoặc Chưa thuộc (ôn lại)', color: 'border-slate-700 bg-slate-800/50 text-slate-400' },
            { icon: '→', label: 'Ghi nhớ', desc: 'Học từ mới (tốn 1 ⚡) và bắt đầu hành trình SRS', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' },
            { icon: '✓', label: 'Đã biết', desc: 'Bỏ qua học, đánh dấu "Thành thạo" ngay lập tức', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' },
        ],
    },
    {
        icon: Mic,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/15 border-cyan-500/30',
        title: 'Voice Mode',
        body: 'Bật Voice Mode để luyện phát âm. Thay vì quẹt tay, bạn phải nói đúng từ 3 lần liên tiếp mới được "nhớ".',
        detail: 'Boss Card 🗡️ luôn yêu cầu Voice Mode, kể cả khi bạn đang ở Touch Mode.',
    },
    {
        icon: Trophy,
        iconColor: 'text-amber-400',
        iconBg: 'bg-amber-500/15 border-amber-500/30',
        title: 'Hệ thống ôn tập thông minh',
        body: 'Mỗi từ bạn học sẽ được lên lịch ôn tập tự động: 1 ngày → 3 ngày → 7 ngày → 14 ngày.',
        detail: 'Swipe Deck chỉ chứa tối đa 3 từ ôn tập để ưu tiên từ mới. Hãy vào trang "Ôn tập" để giải quyết hết các từ đến hạn.',
    },
    {
        icon: Sprout,
        iconColor: 'text-cyan-400',
        iconBg: 'bg-cyan-500/15 border-cyan-500/30',
        title: 'Trạng thái từ vựng',
        body: 'Tiến độ "Thành thạo" phản ánh số lượng từ thực sự nằm trong trí nhớ dài hạn của bạn:',
        detail: null,
        cards: [
            { icon: <Sprout className="w-4 h-4" />, label: 'Seed — Mầm non', desc: 'Mới gặp, chưa vào bộ nhớ dài hạn', color: 'border-slate-700 bg-slate-800/50 text-slate-500' },
            { icon: <Leaf className="w-4 h-4" />, label: 'Sprout — Đang nhớ', desc: 'Đã ôn 1–2 lần, đang củng cố', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-500' },
            { icon: <Sparkles className="w-4 h-4" />, label: 'Gold — Thuộc tốt', desc: 'Nhớ vững, ôn thưa dần', color: 'border-cyan-400/40 bg-cyan-500/20 text-cyan-400' },
            { icon: <Trophy className="w-4 h-4" />, label: 'Mastered — Thành thạo', desc: 'Nhớ lâu dài, hoàn thành mục tiêu', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
        ],
    },
    {
        icon: Flame,
        iconColor: 'text-orange-400',
        iconBg: 'bg-orange-500/15 border-orange-500/30',
        title: 'Streak & Trang "Đã học"',
        body: 'Mỗi ngày bạn swipe ít nhất 1 từ = +1 streak 🔥. Bỏ 1 ngày là streak về 0. Đạt các mốc 7, 14, 30, 60, 100 ngày để tự hào.',
        detail: 'Vào trang "Đã học" để xem toàn bộ từ vựng đã học, lịch ôn tập SRS theo ngày, tiến trình Story Pack — và nhấn vào từng từ để xem chi tiết.',
    },
];

const PERSONA_OPTIONS: Array<{
    type: UserArchetype;
    icon: typeof User;
    label: string;
    description: string;
    color: string;
    bgColor: string;
}> = [
        {
            type: 'casual',
            icon: User,
            label: 'Người học thường',
            description: 'Tình huống hàng ngày, giao tiếp đời sống',
            color: 'text-cyan-400',
            bgColor: 'border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20',
        },
        {
            type: 'tech',
            icon: Laptop,
            label: 'Lập trình viên / Tech',
            description: 'Ngữ cảnh công nghệ, startup, lập trình',
            color: 'text-purple-400',
            bgColor: 'border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20',
        },
        {
            type: 'business',
            icon: Briefcase,
            label: 'Doanh nghiệp / Chuyên nghiệp',
            description: 'Môi trường công sở, kinh doanh, thương mại',
            color: 'text-amber-400',
            bgColor: 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20',
        },
        {
            type: 'student',
            icon: GraduationCap,
            label: 'Học sinh / Sinh viên',
            description: 'Trường học, kỳ thi, học thuật',
            color: 'text-emerald-400',
            bgColor: 'border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20',
        },
    ];

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [selectedPersona, setSelectedPersona] = useState<UserArchetype | null>(null);
    const { click } = useSoundEffects();
    const setUserArchetype = useLexicaStore(state => state.setUserArchetype);

    const currentStep = STEPS[step];
    const Icon = currentStep.icon;
    const isLast = step === STEPS.length - 1;
    const isPersonaStep = 'isPersonaSelection' in currentStep && currentStep.isPersonaSelection;

    const goNext = () => {
        // If on persona selection step, save the selection before proceeding
        if (isPersonaStep && selectedPersona) {
            setUserArchetype(selectedPersona);
        }

        if (isLast) { onComplete(); return; }
        setDirection(1);
        setStep(s => s + 1);
    };

    const goPrev = () => {
        setDirection(-1);
        setStep(s => s - 1);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-t-3xl sm:rounded-2xl p-6 pb-8 mx-0 sm:mx-4 overflow-hidden"
            >
                {/* Skip button */}
                <button
                    onClick={() => {
                        click();
                        onComplete();
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-200"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-1.5 mb-6">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${i === step ? 'bg-cyan-400 w-6' : i < step ? 'bg-cyan-600 w-3' : 'bg-slate-600 w-3'}`}
                        />
                    ))}
                </div>

                {/* Content — slides in */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        initial={{ x: direction * 60, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: direction * -60, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 min-h-48"
                    >
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${currentStep.iconBg}`}>
                            <Icon className={`w-7 h-7 ${currentStep.iconColor}`} />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-white">{currentStep.title}</h2>

                        {/* Body */}
                        <p className="text-slate-300 text-sm leading-relaxed">{currentStep.body}</p>

                        {/* Persona Selection (step 2) */}
                        {isPersonaStep && (
                            <div className="space-y-2.5 mt-4">
                                {PERSONA_OPTIONS.map((persona) => {
                                    const PersonaIcon = persona.icon;
                                    const isSelected = selectedPersona === persona.type;
                                    return (
                                        <button
                                            key={persona.type}
                                            onClick={() => {
                                                click();
                                                setSelectedPersona(persona.type);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${isSelected ? persona.bgColor + ' ring-2 ring-offset-2 ring-offset-slate-800' : 'border-slate-600 bg-slate-700/30 hover:bg-slate-700/50'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${isSelected ? persona.bgColor : 'bg-slate-600/50'} flex items-center justify-center shrink-0`}>
                                                <PersonaIcon className={`w-5 h-5 ${isSelected ? persona.color : 'text-slate-400'}`} />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>{persona.label}</p>
                                                <p className={`text-xs mt-0.5 ${isSelected ? persona.color : 'text-slate-400'}`}>{persona.description}</p>
                                            </div>
                                            {isSelected && (
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${persona.color}`}>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-current"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Swipe cards (step 3 only) */}
                        {'cards' in currentStep && currentStep.cards && (
                            <div className="space-y-2 mt-2">
                                {currentStep.cards.map(c => (
                                    <div key={c.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${c.color}`}>
                                        <span className="text-xl font-bold w-5 flex items-center justify-center shrink-0">{c.icon}</span>
                                        <div>
                                            <p className="font-semibold text-sm">{c.label}</p>
                                            <p className="text-xs opacity-75 mt-0.5">{c.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Detail */}
                        {currentStep.detail && (
                            <p className="text-xs text-slate-400 bg-slate-700/50 rounded-lg px-3 py-2.5 leading-relaxed border border-slate-700">
                                {currentStep.detail}
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 gap-3">
                    <button
                        onClick={() => {
                            click();
                            goPrev();
                        }}
                        disabled={step === 0}
                        className="p-2.5 rounded-xl border border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => {
                            click();
                            goNext();
                        }}
                        disabled={isPersonaStep && !selectedPersona}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-sm transition-colors active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-cyan-500"
                    >
                        {isLast ? 'Bắt đầu học!' : 'Tiếp theo'}
                        {!isLast && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
