"use client";

import { Terminal, Building2 } from "lucide-react";
import { type ThemeId } from "../lib/themes";

export default function ThemePicker({ onPick }: { onPick: (id: ThemeId) => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#08080a]">
            {/* Subtle ambient glow blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#3dff7a]/5 blur-[120px]" />
                <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#e8473f]/5 blur-[120px]" />
            </div>

            {/* Header */}
            <div className="relative z-10 mb-12 text-center space-y-2">
                <div className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-mono mb-4">
                    Phrasal Verb Training System — v3.0
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    Chọn vũ trụ của bạn
                </h1>
                <p className="text-white/40 text-sm">
                    Mỗi thế giới có lore, nhiệm vụ, và phong cách riêng biệt
                </p>
            </div>

            {/* Theme cards */}
            <div className="relative z-10 grid md:grid-cols-2 gap-6 w-full max-w-4xl px-6">
                {/* ── Synapse Terminal ────────────────────────────────── */}
                <button
                    onClick={() => onPick("synapse")}
                    className="group relative text-left overflow-hidden border border-[#3dff7a]/20 bg-[#0a0a0a] hover:border-[#3dff7a]/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(61,255,122,0.12)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: "radial-gradient(#3dff7a 1px, transparent 1px)",
                            backgroundSize: "24px 24px",
                        }}
                    />
                    {/* Glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#3dff7a]/[0.03] pointer-events-none" />

                    <div className="relative z-10 p-8 space-y-6">
                        {/* Badge */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 border border-[#3dff7a]/30 bg-black">
                                    <Terminal className="w-6 h-6 text-[#3dff7a]" />
                                </div>
                            </div>
                            <div className="text-[8px] font-bold border border-[#3dff7a]/20 px-2 py-0.5 text-[#3dff7a]/40">
                                ID: SYN-001
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
                                SYNAPSE TERMINAL
                            </h2>
                            <p className="text-[#3dff7a] text-xs tracking-[0.3em] uppercase mt-1">
                                Cyberpunk · Survival · Brutal
                            </p>
                        </div>

                        {/* Preview description */}
                        <p className="text-white/50 text-sm leading-relaxed">
                            Thế giới tương lai. Ngôn ngữ là vũ khí. Phrasal verbs là code
                            khẩn cấp trong terminal bảo mật. Sai một từ — hệ thống sập.
                        </p>

                        {/* Visual accent bar */}
                        <div className="space-y-2">
                            <div className="h-px bg-[#3dff7a]/10" />
                            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-white/30">
                                <span className="text-[#3dff7a]">Cyberpunk</span>
                                <span>Wasteland</span>
                                <span className="text-right">+2 worlds</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-end pt-2">
                            <div className="text-[#3dff7a] text-xs font-black uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                ENTER <span className="text-lg leading-none">→</span>
                            </div>
                        </div>
                    </div>
                </button>

                {/* ── Đô Thị Trọng Sinh ───────────────────────────────── */}
                <button
                    onClick={() => onPick("urban")}
                    className="group relative text-left overflow-hidden rounded-2xl border border-[#e8473f]/15 bg-white hover:border-[#e8473f]/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(232,71,63,0.12)]"
                    style={{ fontFamily: "var(--font-sans)" }}
                >
                    {/* City skyline silhouette */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-24 opacity-[0.07] pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 100'%3E%3Cpath d='M0 100V60h20V40h20V20h20V40h40V30h20V10h20V30h20V20h20V0h20V20h20V10h20V30h20V20h20V40h20V30h20V20h20V30h40V40h20V20h20V10h20V20h20V30h20V20h20V40h20V30h20V20h20V40h20V60h20V100z' fill='%23e8473f'/%3E%3C/svg%3E")`,
                            backgroundSize: "cover",
                            backgroundPosition: "bottom",
                        }}
                    />
                    {/* Warm glow on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#e8473f]/[0.02] pointer-events-none" />

                    <div className="relative z-10 p-8 space-y-6">
                        {/* Icon */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-50 border border-[#e8473f]/20">
                                <Building2 className="w-6 h-6 text-[#e8473f]" />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Đô Thị Trọng Sinh
                            </h2>
                            <p className="text-[#e8473f] text-xs tracking-wide mt-1">
                                Hiện đại · Cuộc sống thường ngày
                            </p>
                        </div>

                        {/* Preview description */}
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Bạn được sống lại. Cùng một thành phố, cùng những con người đó —
                            nhưng lần này bạn biết tất cả. Ngôn ngữ là cửa đến đỉnh cao.
                        </p>

                        {/* Visual accent bar */}
                        <div className="space-y-2">
                            <div className="h-px bg-[#e8473f]/10" />
                            <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400">
                                <span className="text-[#e8473f]">Thương trường</span>
                                <span>Ẩm thực</span>
                                <span className="text-right">+2 đời sống</span>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-end pt-2">
                            <div className="text-[#e8473f] text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                Trọng sinh <span className="text-lg leading-none">→</span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}
