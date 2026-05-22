'use client';

import { useState } from 'react';
import { Lightbulb, Target as TargetIcon } from 'lucide-react';
import { DifficultyLevel } from './VocabCard';
import { useSoundEffects } from '../hooks/useSoundEffects';

interface TestQuestion {
    id: string;
    word: string;
    ipa: string;
    scenario: string;
    options: string[];
    correctAnswer: number; // index in options array
    level: DifficultyLevel;
    elo: number;
}

const TEST_QUESTIONS: TestQuestion[] = [
    {
        id: 'q1',
        word: 'ABUNDANT',
        ipa: 'əˈbʌndənt',
        scenario: 'Ảnh couple mới của ex tôi ABUNDANT trên Instagram vãi.',
        options: ['Hiếm hoi, khan hiếm', 'Dư thừa, nhiều hơn cần thiết', 'Đẹp đẽ, ấn tượng', 'Gây shock, bất ngờ'],
        correctAnswer: 1,
        level: 'beginner',
        elo: 850,
    },
    {
        id: 'q2',
        word: 'OBVIOUS',
        ipa: 'ˈɒbviəs',
        scenario: 'Lý do OBVIOUS nhất tôi thức khuya là YouTube bảo "chỉ 1 video nữa thôi".',
        options: ['Kỳ lạ, bí ẩn', 'Rõ ràng, hiển nhiên', 'Nguy hiểm, đáng lo', 'Hài hước, buồn cười'],
        correctAnswer: 1,
        level: 'beginner',
        elo: 870,
    },
    {
        id: 'q3',
        word: 'FEASIBLE',
        ipa: 'ˈfiːzəbl',
        scenario: 'Ngủ đủ 8 tiếng mà làm 2 công việc có FEASIBLE không? Không luôn.',
        options: ['Dễ dàng, đơn giản', 'Khả thi, có thể thực hiện được', 'Vui vẻ, thú vị', 'Căng thẳng, mệt mỏi'],
        correctAnswer: 1,
        level: 'beginner',
        elo: 975,
    },
    {
        id: 'q4',
        word: 'UBIQUITOUS',
        ipa: 'juːˈbɪkwɪtəs',
        scenario: 'Lo âu thì UBIQUITOUS trong đời tôi như Wi-Fi free vậy.',
        options: ['Nguy hiểm, đáng sợ', 'Phổ biến khắp nơi, có mặt mọi lúc', 'Tạm thời, nhất thời', 'Khó chịu, bực bội'],
        correctAnswer: 1,
        level: 'intermediate',
        elo: 1050,
    },
    {
        id: 'q5',
        word: 'CONTEMPLATE',
        ipa: 'ˈkɒntəmpleɪt',
        scenario: 'Tôi CONTEMPLATE việc nhắn "còn thức không?" lúc 2h sáng quá thường xuyên.',
        options: ['Hối hận, tiếc nuối', 'Từ chối, phản đối', 'Suy ngẫm, trầm tư', 'Thực hiện, hành động'],
        correctAnswer: 2,
        level: 'intermediate',
        elo: 1080,
    },
    {
        id: 'q6',
        word: 'CYNICAL',
        ipa: 'ˈsɪnɪkl',
        scenario: 'Tôi trở nên CYNICAL sau khi xem đủ "sự thật về" video trên YouTube.',
        options: ['Lạc quan, tin tưởng', 'Hào hứng, nhiệt tình', 'Hoài nghi, hay chỉ trích', 'Mơ mộng, viển vông'],
        correctAnswer: 2,
        level: 'intermediate',
        elo: 1150,
    },
    {
        id: 'q7',
        word: 'RECALCITRANT',
        ipa: 'rɪˈkælsɪtrənt',
        scenario: 'Laptop RECALCITRANT của tôi từ chối update như mục tiêu cuộc đời vậy.',
        options: ['Cũ kỹ, lỗi thời', 'Chậm chạp, lag', 'Ngoan cố, bướng bỉnh', 'Hỏng hóc, lỗi'],
        correctAnswer: 2,
        level: 'advanced',
        elo: 1250,
    },
    {
        id: 'q8',
        word: 'CLANDESTINE',
        ipa: 'klænˈdestɪn',
        scenario: 'Cuộc họp CLANDESTINE của tôi với bạn thân: kêu ốm rồi ra ngoài ăn phở.',
        options: ['Ồn ào, náo nhiệt', 'Tốn tiền, xa xỉ', 'Bí mật, lén lút', 'Kéo dài, mệt mỏi'],
        correctAnswer: 2,
        level: 'advanced',
        elo: 1350,
    },
    {
        id: 'q9',
        word: 'ESOTERIC',
        ipa: 'ˌesəˈterɪk',
        scenario: 'Sở thích ESOTERIC của tôi: sưu tầm font chữ — không ai hiểu tại sao.',
        options: ['Thông dụng, phổ biến', 'Bí truyền, chỉ người trong nghề hiểu', 'Đắt tiền, hiếm có', 'Cổ xưa, lỗi thời'],
        correctAnswer: 1,
        level: 'expert',
        elo: 1400,
    },
    {
        id: 'q10',
        word: 'BYZANTINE',
        ipa: 'ˈbɪzəntiːn',
        scenario: 'Quy trình BYZANTINE xin reimbursement của công ty dài hơn cả dự án tôi làm.',
        options: ['Nhanh chóng, hiệu quả', 'Cổ kính, hoài cổ', 'Phức tạp rắc rối đến mức khó tin', 'Tốn kém, lãng phí'],
        correctAnswer: 2,
        level: 'expert',
        elo: 1470,
    },
];

interface LevelTestProps {
    onComplete: (score: number, recommendedLevel: DifficultyLevel, calibratedElo?: number) => void;
    onBack: () => void;
}

export default function LevelTest({ onComplete, onBack }: LevelTestProps) {
    const { click, quizCorrect, quizWrong } = useSoundEffects();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const currentQuestion = TEST_QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / TEST_QUESTIONS.length) * 100;

    const handleSelectOption = (optionIndex: number) => {
        click();
        setSelectedOption(optionIndex);
    };

    const handleNext = () => {
        if (selectedOption === null) return;

        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        if (isCorrect) {
            quizCorrect();
        } else {
            quizWrong();
        }

        const newAnswers = [...answers, selectedOption];
        setAnswers(newAnswers);

        if (currentQuestionIndex < TEST_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            const score = calculateScore(newAnswers);
            const calibratedElo = calculateCalibratedElo(newAnswers);
            const recommendedLevel = getRecommendedLevel(calibratedElo);
            onComplete(score, recommendedLevel, calibratedElo);
        }
    };

    const handleSkip = () => {
        click();
        // -1 = skipped, treated as wrong
        const newAnswers = [...answers, -1];
        setAnswers(newAnswers);

        if (currentQuestionIndex < TEST_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            const score = calculateScore(newAnswers);
            const calibratedElo = calculateCalibratedElo(newAnswers);
            const recommendedLevel = getRecommendedLevel(calibratedElo);
            onComplete(score, recommendedLevel, calibratedElo);
        }
    };

    const calculateScore = (answers: number[]): number => {
        return TEST_QUESTIONS.reduce((count, question, index) => {
            return count + (answers[index] === question.correctAnswer ? 1 : 0);
        }, 0);
    };

    /** Average ELO of correctly answered questions, defaulting to 800 if none correct */
    const calculateCalibratedElo = (answers: number[]): number => {
        const correctElos = TEST_QUESTIONS
            .filter((q, i) => answers[i] === q.correctAnswer)
            .map(q => q.elo);
        if (correctElos.length === 0) return 800;
        return Math.round(correctElos.reduce((a, b) => a + b, 0) / correctElos.length);
    };

    const getRecommendedLevel = (elo: number): DifficultyLevel => {
        if (elo < 950) return 'beginner';
        if (elo < 1150) return 'intermediate';
        if (elo < 1350) return 'advanced';
        return 'expert';
    };

    return (
        <div className="w-full h-full px-4">
            {/* Logo - Top Left */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    LEXICA
                </h1>
            </div>

            {/* Content */}
            <div className="w-full max-w-2xl mx-auto pt-20 md:pt-24 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => {
                            click();
                            onBack();
                        }}
                        className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                    >
                        <span>←</span>
                        <span className="hidden sm:inline">Quay lại</span>
                    </button>
                    <div className="text-sm text-slate-400">
                        <span className="text-white font-medium">{currentQuestionIndex + 1}</span> / {TEST_QUESTIONS.length}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Question Card */}
                <div className="bg-white/[0.02] border border-white/20 rounded-xl p-8 md:p-10 space-y-8">
                    {/* Word and IPA */}
                    <div className="text-center space-y-3">
                        <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight">
                            {currentQuestion.word}
                        </h2>
                        <p className="text-slate-400 font-mono text-sm">
                            /{currentQuestion.ipa}/
                        </p>
                    </div>

                    {/* Question */}
                    <div className="text-center py-4">
                        <p className="text-lg text-slate-300">
                            Từ này có nghĩa là gì?
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleSelectOption(index)}
                                    className={`
                                    w-full p-4 rounded-lg text-left transition-all
                                    ${isSelected
                                            ? 'bg-cyan-500/10 border border-cyan-500/50'
                                            : 'bg-white/[0.02] border border-white/20 hover:bg-white/[0.04] hover:border-white/30'
                                        }
                                `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                        w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                                        ${isSelected
                                                ? 'border-cyan-400 bg-cyan-400'
                                                : 'border-slate-600'
                                            }
                                    `}>
                                            {isSelected && (
                                                <svg className="w-3 h-3 text-slate-900 font-bold" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-sm leading-relaxed ${isSelected ? 'text-white font-medium' : 'text-slate-300'
                                            }`}>
                                            {option}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Next / Skip Buttons */}
                    <div className="space-y-2 pt-4">
                        <button
                            onClick={handleNext}
                            disabled={selectedOption === null}
                            className={`
                            w-full py-4 rounded-lg font-semibold transition-all
                            ${selectedOption !== null
                                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                }
                        `}
                        >
                            {currentQuestionIndex < TEST_QUESTIONS.length - 1 ? (
                                'Câu tiếp theo →'
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Xem kết quả
                                    <TargetIcon className="w-5 h-5" />
                                </span>
                            )}
                        </button>
                        <button
                            onClick={handleSkip}
                            className="w-full py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Bỏ qua câu này
                        </button>
                    </div>
                </div>

                {/* Helper Text */}
                <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Chọn đáp án phù hợp nhất với nghĩa của từ trong câu
                </div>
            </div>
        </div>
    );
}

