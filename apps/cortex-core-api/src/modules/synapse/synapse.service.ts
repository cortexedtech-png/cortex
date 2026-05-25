import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ActionLog, SynapseScenario, StoryArc } from '@cortex/types';
import { WORLD_BIBLES } from './world-bibles';
import { GeminiProvider, GemmaProvider, GroqProvider } from './llm.provider';

@Injectable()
export class SynapseService {
  private readonly logger = new Logger(SynapseService.name);

  constructor(
    private supabaseService: SupabaseService,
    private geminiProvider: GeminiProvider,
    private groqProvider: GroqProvider,
    private gemmaProvider: GemmaProvider,
  ) { }

  async generateScenario(
    sessionId: string,
    stage: number,
    sessionHistory: ActionLog[] = [],
    loreId: string = 'cyberpunk-01',
    missionId?: string,
  ): Promise<SynapseScenario> {
    this.logger.log(
      `Generating scenario for session ${sessionId}, stage ${stage} with lore ${loreId}, mission ${missionId}`,
    );

    const lore = WORLD_BIBLES[loreId] || WORLD_BIBLES['cyberpunk-01'];
    const mission =
      lore.missions.find((m) => m.id === missionId) || lore.missions[0];

    let historyContext = '';
    const usedExpressions: string[] = [];

    if (sessionHistory && sessionHistory.length > 0) {
      const allHistory = sessionHistory.filter(
        (log) => log.actionType === 'CHOOSE_PARTICLE',
      );

      // Collect all expressions used (correct answers) to avoid repeating
      allHistory.forEach((log) => {
        const meta = (log.metadata as { particle?: string } | null) ?? {};
        if (meta.particle) usedExpressions.push(meta.particle);
      });

      // Only take last 2 for narrative continuity
      const recentHistory = allHistory.slice(-2);
      const pastChoices = recentHistory
        .map((log) => {
          const meta =
            (log.metadata as {
              stage?: number;
              particle?: string;
              isCorrect?: boolean;
              outcome?: string;
            } | null) ?? {};
          const outcomeSnippet = meta.outcome?.slice(0, 80) ?? '';
          return `Stage ${meta.stage}: "${meta.particle}" (${meta.isCorrect ? 'correct' : 'wrong'}) → ${outcomeSnippet}`;
        })
        .join('\n');

      if (pastChoices) {
        historyContext = `RECENT HISTORY (continue from last outcome):\n${pastChoices}`;
      }
    }

    // Shuffle expression pool so LLM doesn't always pick first items
    const expressionPool = [
      // Core
      'stand firm',
      'back out',
      'give in',
      'take over',
      'call off',
      'reach out',
      'follow up',
      'stand out',
      'hand in',
      'step up',
      'break the ice',
      'save face',
      'lose face',
      'back down',
      'hold back',
      'pull through',
      'make a deal',
      'close a deal',
      'walk away',
      'speak up',
      'pull out',
      'bow out',
      'move on',
      'push back',
      'take charge',
      'cut a deal',
      'seal the deal',
      'lay low',
      'take a stand',
      'step back',
      'speak out',
      'give up',
      'go ahead',
      'back off',
      'open up',
      // Extended
      'buy time',
      'play hardball',
      'draw the line',
      'hold the line',
      'press on',
      'bite the bullet',
      'feel out',
      'sound out',
      'cut ties',
      'ride out',
      'dig in',
      'hold off',
      'stand up to',
      'jump ship',
      'own up',
      'fend off',
      'hold out',
      'play along',
      'take the lead',
      'lock in',
      'break off',
      'branch out',
      'double down',
      'come clean',
      'step down',
      'bring up',
      'back up',
      'cash out',
      'face off',
      'play it safe',
      'settle for',
      'stay put',
      'show up',
      'call out',
      'buy in',
    ];
    for (let i = expressionPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [expressionPool[i], expressionPool[j]] = [
        expressionPool[j],
        expressionPool[i],
      ];
    }
    const expressionBank = expressionPool.slice(0, 18).join(', ');

    const forbiddenLine =
      usedExpressions.length > 0
        ? `FORBIDDEN (already used this session — do NOT use these as correct answer or wrong options): ${[...new Set(usedExpressions)].join(', ')}`
        : '';

    const factionsText = lore.factions
      .map((f) => `• ${f.name}: ${f.description}`)
      .join('\n');

    const prompt = `
You are a Vietnamese language learning game designer. Generate ONE scenario in JSON.

WORLD: ${lore.name} — ${lore.toneDescriptor}
CONTEXT: ${lore.context}
KEY CHARACTERS: ${factionsText}
MISSION: ${mission.briefing}
STAGE: ${stage}/5
${historyContext ? historyContext + '\n' : ''}${forbiddenLine ? forbiddenLine + '\n' : ''}
HOW THE GAME WORKS:
The player reads a Vietnamese story that DESCRIBES an action using Vietnamese words.
They pick which English expression matches that Vietnamese description.
The correct English expression is the TRANSLATION of the Vietnamese action in the story.
The 3 wrong options must have CLEARLY DIFFERENT meanings.

CRITICAL RULE — narrative must contain the Vietnamese meaning of the correct answer:
- Story describes the needed action in Vietnamese (e.g., "rút lui khỏi thương vụ")
- Correct answer is the English expression for that (e.g., "back out")
- Wrong options mean something completely different (e.g., "close a deal" = chốt hợp đồng, "step up" = tự nguyện đảm nhận, "lay low" = ẩn mình chờ thời)
- Player reads the Vietnamese and recognizes which English matches

NARRATIVE FORMAT (follow exactly):
- 2 vivid sentences with real character names (${lore.factions[0]?.name || 'characters from the world'}, etc.) and real stakes
- Final sentence: describes the needed action IN VIETNAMESE then ends with ___
  Example: "Thương vụ này không xứng đáng. Bạn quyết định rút lui và không nhìn lại. Bạn ___"
  → Correct: "back out". The Vietnamese phrase "rút lui" IS the clue.
  DO NOT make the final sentence generic like "Bạn cần làm gì đó. Bạn ___"

DIFFICULTY BY STAGE:
- Stage 1-2: Very direct clue — Vietnamese phrase maps 1-to-1 with correct expression
- Stage 3-4: Moderate — situation context implies the action
- Stage 5: Subtle — implied by situation, not stated directly

WRONG OPTIONS:
- Each wrong option's meaning clearly does NOT match the Vietnamese clue in the narrative
- Each outcome is a vivid, specific consequence unique to THAT wrong expression
- Example: if wrong option is "step up" (tự nguyện đảm nhận): outcome = "Bạn xung phong nhận thêm việc trước mặt ${lore.factions[lore.factions.length - 1]?.name ?? 'đối thủ'} — họ mỉm cười. Bạn vừa tự tạo bẫy cho mình."

SITUATION VARIETY — pick ONE (different from history above):
${lore.situationTypes.join(' | ')}

EXPRESSION BANK (shuffled — pick from these, favor ones near the start of this list):
${expressionBank}

MEANINGS FIELD: Vietnamese only, 4 words max.

OUTPUT — JSON only, no prose, no markdown:
{
  "missionCode": "${lore.codePrefix}-${stage}-${Math.floor(Math.random() * 1000)}",
  "baseVerb": "___",
  "narrative": "string",
  "choices": [{"particle": "string", "meaning": "string", "outcome": "string", "isCorrect": boolean, "effect": "string"}],
  "technicalHint": "",
  "isFinalBoss": ${stage === 5}
}
`;

    // Strategy: Groq (Llama 3.3) -> Gemma (Local) -> Fallback
    try {
      this.logger.log('Attempting Groq...');
      return await this.groqProvider.generateScenario(prompt);
    } catch (groqErr: unknown) {
      const groqMsg =
        groqErr instanceof Error ? groqErr.message : String(groqErr);
      this.logger.warn(`Groq failed: ${groqMsg}. Trying Local Gemma...`);
      try {
        return await this.gemmaProvider.generateScenario(prompt);
      } catch (localErr: unknown) {
        const localMsg =
          localErr instanceof Error ? localErr.message : String(localErr);
        this.logger.warn(`Local Gemma failed: ${localMsg}`);
        this.logger.error(`All AI Providers failed.`);
        return this.getHardcodedFallback(stage);
      }
    }
  }

  async generateStoryArc(
    loreId: string,
    missionId?: string,
  ): Promise<StoryArc> {
    const lore = WORLD_BIBLES[loreId] || WORLD_BIBLES['cyberpunk-01'];
    const mission =
      lore.missions.find((m) => m.id === missionId) || lore.missions[0];

    const factionsText = lore.factions
      .map((f) => `• ${f.name}: ${f.description}`)
      .join('\n');
    const antagonist =
      lore.factions[lore.factions.length - 1]?.name || 'đối thủ';

    const rand = Math.floor(Math.random() * 1000);

    const processArc = (result: { stages: SynapseScenario[] }): StoryArc => ({
      arcId: `${lore.codePrefix}-${Date.now()}`,
      loreId,
      missionId,
      stages: (result.stages || []).slice(0, 5).map((s, i) => ({
        ...s,
        baseVerb: '___',
        missionCode: `${lore.codePrefix}-${i + 1}-${rand}`,
        isFinalBoss: i === 4,
      })),
    });

    // ── BLUEPRINT PATH ─────────────────────────────────────────────────────────
    // When a mission has 5 pre-authored scene blueprints, skip full generation.
    // LLM only writes Vietnamese prose + outcome text; plot is fixed.
    if (mission.scenarios && mission.scenarios.length >= 5) {
      const scenesBlock = mission.scenarios
        .map(
          (bp) =>
            `STAGE ${bp.stage} [${bp.arcLabel}]
  Scene: ${bp.scene}
  Situation: ${bp.situation}
  CORRECT expression: "${bp.correctExpression}" (meaning: ${bp.correctMeaning})
  Why correct: ${bp.correctRationale}
  WRONG options:
${bp.wrongOptions.map((w) => `    • "${w.expression}": ${w.consequence}`).join('\n')}
  Key sensory detail to embed: ${bp.keyDetail}`,
        )
        .join('\n\n');

      const blueprintPrompt = `
You are a Vietnamese drama writer producing content for a language-learning game.
5 scenes have been fully scripted. Your only job: write the Vietnamese narrative prose and outcome text.
Do NOT invent new plot events. Follow each blueprint exactly.

WORLD: ${lore.name}
CONTEXT: ${lore.context}

CHARACTERS:
${factionsText}

══════════════════════════════════════════
NARRATIVE RULES — read carefully before writing
══════════════════════════════════════════

RULE 1 — PERSPECTIVE: Always write "Bạn" (second person). NEVER write "Tôi".

RULE 2 — THE BLANK ___
The narrative is a fill-in-the-blank game. The player reads 2-3 sentences then
sees a sentence with ___ and must pick which English expression fits.
___ must appear ONCE, embedded inside a sentence so that inserting the correct
English expression makes the sentence grammatically and logically complete.

✗ WRONG — instruction leaked into text:
  "Bạn cần ___ giữa câu và tiếp tục trình bày."
  (The phrase "giữa câu" is a meta-instruction, not story text. Never write it.)

✗ WRONG — blank at end with no context after:
  "Đây là lúc bạn ___."

✓ CORRECT — blank mid-sentence with object/context after:
  "[2 câu cảnh huống cụ thể dùng keyDetail từ blueprint]. Bạn quyết định ___ [mục tiêu/ngữ cảnh cụ thể từ situation], không [hành động thay thế họ mong đợi]."
  "Bạn chọn cách ___ trước khi [ai đó] kịp [hành động ngăn cản]."
  "Bạn buộc phải ___ ngay lúc này — mỗi giây [hậu quả cụ thể nếu không làm]."

RULE 3 — NARRATIVE SHOWS, doesn't explain.
The narrative describes the SITUATION, not the solution.
✗ WRONG: "Bạn quyết định lên tiếng. Bạn ___." (already told the answer)
✓ CORRECT: "[Cảnh quan cụ thể từ blueprint]. [keyDetail từ blueprint]. Bạn quyết định ___ trước [người/ngưỡng], không [hành động bị động]."
Phải để người chơi cảm nhận được sức căng thẳng và suy ra hành động từ ngữ cảnh.

RULE 4 — OUTCOMES show POWER SHIFT, not generic success.
✗ WRONG: "Bạn thành công và mọi người ấn tượng với bạn."
✓ CORRECT: "[Nhân vật cấp trên] [hành động vật lý cụ thể]. [Nhân vật đối địch] [phản ứng lần đầu tiên] — dấu hiệu thấy được của sự dịch chuyển quyền lực."
Each wrong outcome must be specific to THAT wrong expression's consequence (from blueprint).

RULE 5 — SENSORY DETAIL: Embed the keyDetail from the blueprint into the narrative naturally.

RULE 6 — CONTINUITY: From Stage 2 onward, reference specific events from the previous stage by name.

══════════════════════════════════════════
THE 5 SCENES
══════════════════════════════════════════
${scenesBlock}

══════════════════════════════════════════
OUTPUT — JSON ONLY, no markdown, no explanation
══════════════════════════════════════════
For each stage, the correct expression and wrong expressions are specified in the blueprint above.
Use exactly those expressions. Fill in the narrative and outcome text.

{
  "stages": [
    {
      "missionCode": "STAGE-1",
      "baseVerb": "___",
      "narrative": "2-3 cinematic sentences in Vietnamese (Bạn). Final sentence has ___ mid-sentence with words after it.",
      "choices": [
        {"particle": "${mission.scenarios[0].correctExpression}", "meaning": "${mission.scenarios[0].correctMeaning}", "outcome": "Specific power-shift: what physically changes in the room.", "isCorrect": true, "effect": ""},
        {"particle": "${mission.scenarios[0].wrongOptions[0]?.expression ?? 'wrong-1'}", "meaning": "Vietnamese 3-4 words", "outcome": "Specific consequence from blueprint for this wrong choice.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[0].wrongOptions[1]?.expression ?? 'wrong-2'}", "meaning": "Vietnamese 3-4 words", "outcome": "Specific consequence from blueprint for this wrong choice.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[0].wrongOptions[2]?.expression ?? 'wrong-3'}", "meaning": "Vietnamese 3-4 words", "outcome": "Specific consequence from blueprint for this wrong choice.", "isCorrect": false, "effect": ""}
      ],
      "technicalHint": "",
      "isFinalBoss": false
    },
    {
      "missionCode": "STAGE-2",
      "baseVerb": "___",
      "narrative": "2-3 cinematic sentences. References specific event from Stage 1. ___ mid-sentence.",
      "choices": [
        {"particle": "${mission.scenarios[1].correctExpression}", "meaning": "${mission.scenarios[1].correctMeaning}", "outcome": "Specific power-shift outcome.", "isCorrect": true, "effect": ""},
        {"particle": "${mission.scenarios[1].wrongOptions[0]?.expression ?? 'wrong-1'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[1].wrongOptions[1]?.expression ?? 'wrong-2'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[1].wrongOptions[2]?.expression ?? 'wrong-3'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""}
      ],
      "technicalHint": "",
      "isFinalBoss": false
    },
    {
      "missionCode": "STAGE-3",
      "baseVerb": "___",
      "narrative": "2-3 cinematic sentences. References Stage 2. ___ mid-sentence.",
      "choices": [
        {"particle": "${mission.scenarios[2].correctExpression}", "meaning": "${mission.scenarios[2].correctMeaning}", "outcome": "Specific power-shift outcome.", "isCorrect": true, "effect": ""},
        {"particle": "${mission.scenarios[2].wrongOptions[0]?.expression ?? 'wrong-1'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[2].wrongOptions[1]?.expression ?? 'wrong-2'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[2].wrongOptions[2]?.expression ?? 'wrong-3'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""}
      ],
      "technicalHint": "",
      "isFinalBoss": false
    },
    {
      "missionCode": "STAGE-4",
      "baseVerb": "___",
      "narrative": "2-3 cinematic sentences. References Stage 3. ___ mid-sentence.",
      "choices": [
        {"particle": "${mission.scenarios[3].correctExpression}", "meaning": "${mission.scenarios[3].correctMeaning}", "outcome": "Specific power-shift outcome.", "isCorrect": true, "effect": ""},
        {"particle": "${mission.scenarios[3].wrongOptions[0]?.expression ?? 'wrong-1'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[3].wrongOptions[1]?.expression ?? 'wrong-2'}", "meaning": "Vietnamese 3-4 words", "output": "Blueprint consequence.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[3].wrongOptions[2]?.expression ?? 'wrong-3'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""}
      ],
      "technicalHint": "",
      "isFinalBoss": false
    },
    {
      "missionCode": "STAGE-5",
      "baseVerb": "___",
      "narrative": "2-3 cinematic sentences. All threads converge. ___ mid-sentence. High stakes.",
      "choices": [
        {"particle": "${mission.scenarios[4].correctExpression}", "meaning": "${mission.scenarios[4].correctMeaning}", "outcome": "Final power-shift — the decisive change.", "isCorrect": true, "effect": ""},
        {"particle": "${mission.scenarios[4].wrongOptions[0]?.expression ?? 'wrong-1'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[4].wrongOptions[1]?.expression ?? 'wrong-2'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""},
        {"particle": "${mission.scenarios[4].wrongOptions[2]?.expression ?? 'wrong-3'}", "meaning": "Vietnamese 3-4 words", "outcome": "Blueprint consequence.", "isCorrect": false, "effect": ""}
      ],
      "technicalHint": "",
      "isFinalBoss": true
    }
  ]
}
`;

      this.logger.log(`Using blueprint path for mission ${missionId}...`);
      const result = await this.groqProvider.generateArc(blueprintPrompt);
      return processArc(result);
    }
    // ── END BLUEPRINT PATH ──────────────────────────────────────────────────────

    const expressionPool = [
      // Core
      'stand firm',
      'back out',
      'give in',
      'take over',
      'call off',
      'reach out',
      'follow up',
      'stand out',
      'hand in',
      'step up',
      'break the ice',
      'save face',
      'lose face',
      'back down',
      'hold back',
      'pull through',
      'make a deal',
      'close a deal',
      'walk away',
      'speak up',
      'pull out',
      'bow out',
      'move on',
      'push back',
      'take charge',
      'cut a deal',
      'seal the deal',
      'lay low',
      'take a stand',
      'step back',
      'speak out',
      'give up',
      'go ahead',
      'back off',
      'open up',
      // Extended
      'buy time',
      'play hardball',
      'draw the line',
      'hold the line',
      'press on',
      'bite the bullet',
      'feel out',
      'sound out',
      'cut ties',
      'ride out',
      'dig in',
      'hold off',
      'stand up to',
      'jump ship',
      'own up',
      'fend off',
      'hold out',
      'play along',
      'take the lead',
      'lock in',
      'break off',
      'branch out',
      'double down',
      'come clean',
      'step down',
      'bring up',
      'back up',
      'cash out',
      'face off',
      'play it safe',
      'settle for',
      'stay put',
      'show up',
      'call out',
      'buy in',
    ];
    for (let i = expressionPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [expressionPool[i], expressionPool[j]] = [
        expressionPool[j],
        expressionPool[i],
      ];
    }
    const expressionBank = expressionPool.slice(0, 20).join(', ');

    const missionSection = [
      `MISSION: ${mission.name}`,
      `Setup: ${mission.briefing}`,
      `Winning condition: ${mission.objective}`,
      mission.keyCharacters
        ? `\nKEY CHARACTERS IN THIS MISSION:\n${mission.keyCharacters}`
        : '',
      mission.dramaticTension
        ? `\nCORE DRAMATIC TENSION: ${mission.dramaticTension}`
        : '',
      mission.stakes
        ? `\nSTAKES (what player gains/loses): ${mission.stakes}`
        : '',
      mission.keyMoments?.length
        ? `\nSCENE SEEDS — weave these specific moments into your 5 stages:\n${mission.keyMoments.map((m, i) => `  ${i + 1}. ${m}`).join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const bannedPhrasesBlock = lore.bannedPhrases
      .map((p) => `✗ ${p}`)
      .join('\n');

    const arcPrompt = `
You are a Vietnamese TV drama screenwriter writing a 5-episode thriller arc for a mobile language learning game.

NARRATIVE UNIVERSE: ${lore.name}
WORLD CONTEXT: ${lore.context}

THE CAST:
${factionsText}

${missionSection}

═══ WRITING RULES — FOLLOW ALL OF THEM ═══

RULE 1 — TONE & STYLE: ${lore.writingStyle}
Every scene needs: a power dynamic (who has leverage), a micro-surprise, and real stakes (${lore.stakesDimensions}).
This is NOT a language exercise. This is a thriller.

RULE 2 — BANNED PHRASES (these make the output rejected):
${bannedPhrasesBlock}

RULE 3 — SPECIFICITY. Every sentence must have concrete details.
✗ BAD: "[tên nhân vật] gây áp lực với bạn trong phòng họp."
✓ GOOD: "[tên nhân vật] gõ 3 ngón tay lên bàn, mắt không rời tài liệu số 7. 'Con số này sai 12%,' anh ta nói đủ to để cấp trên quay lại."

RULE 4 — OUTCOMES must shift the power dynamic, not announce a winner.
✗ BAD: "Bạn thành công và mọi người ấn tượng."
✓ GOOD: "Cấp trên đặt bút xuống. 'Để tôi kiểm tra số liệu gốc.' Đối thủ nhìn bạn — lần đầu tiên mất bình tĩnh."
The correct outcome ends the scene on a shift, not a trophy. Wrong outcomes show specific vivid consequences.

RULE 5 — CONTINUITY: Each stage must reference specific events from the previous stage by name.
✗ BAD stage 2: "Sau buổi họp hôm qua..."
✓ GOOD stage 2: "Sau khi bạn phản bác số liệu của [tên đối thủ] trước mặt [tên cấp trên]..."

RULE 6 — USE THE WORLD'S DRAMATIC IRONY: The player knows this world — "${lore.context.slice(0, 80)}..." — write the tension of someone navigating danger they already see coming.

═══ THE 5-STAGE ARC ═══
Stage 1 [HOOK]: First concrete collision with the mission. Something specific goes wrong immediately.
Stage 2 [ESCALATION]: A new complication. References stage 1 events specifically.
Stage 3 [BETRAYAL]: The first visible sign of the antagonist's real move. A twist.
Stage 4 [CRISIS]: Maximum stakes. ${antagonist} makes their move. One wrong step ends everything.
Stage 5 [CLIMAX]: All previous events converge. Final confrontation. "isFinalBoss": true.

═══ GAME MECHANIC — CONTEXTUAL COMPETITION ═══
Each stage has 4 English expressions. ALL 4 must be actions a person could realistically take in THAT specific moment.
Wrong options are tempting alternatives with specific, dramatic consequences.

SITUATIONAL GROUPS — pick one per stage, vary across the 5 stages:
- CONFRONTATION: push back, speak out, stand firm, back off, give in
- NEGOTIATION: stand firm, make a deal, walk away, back down, give in, close a deal
- ALLIANCE: reach out, open up, follow up, break the ice, take charge
- ENDURANCE: pull through, hold back, lay low, step up, hold on
- EXIT: walk away, back out, pull out, bow out, give up

EXPRESSION POOL — pick 5 correct answers (one per stage, no repeats): ${expressionBank}
MEANINGS: Vietnamese only, 3-4 words max.

NARRATIVE FORMAT — CRITICAL:
The blank ___ must be embedded MID-SENTENCE so that when the expression is inserted, the full sentence makes sense.
NEVER end with bare "Bạn ___" — always have words AFTER ___ that complete the action.

✗ BAD: "Bạn cần xây dựng đội ngũ. Bạn ___"
  → "Bạn reach out" — truncated, no object

✓ GOOD: "Bạn quyết định ___ với những thành viên tiềm năng trong ${lore.factions[0]?.name ?? 'liên minh'}, dù biết ${antagonist} đang theo dõi."
  → "Bạn quyết định reach out với những thành viên tiềm năng..." — complete sentence

More valid formats:
- "Bạn ___ trước khi [someone] kịp [action]."
- "Đây là lúc bạn ___ — [consequence if you don't]."
- "Bạn chọn cách ___ với [specific person/group]."
- "Bạn buộc phải ___ ngay lúc này, khi [situation]."

═══ OUTPUT — JSON ONLY ═══
{
  "stages": [
    {
      "missionCode": "STAGE-1", "baseVerb": "___",
      "narrative": "2-3 vivid cinematic sentences. Last sentence embeds ___ mid-sentence with context after. E.g.: 'Bạn quyết định ___ với Giám đốc Phương trước khi Hoàng Minh kịp ngăn lại.'",
      "choices": [
        {"particle": "correct expression", "meaning": "Vietnamese 3-4 words", "outcome": "Specific power-shift outcome — what changes in the room", "isCorrect": true, "effect": ""},
        {"particle": "wrong expression 1", "meaning": "Vietnamese", "outcome": "Specific vivid consequence of this wrong choice", "isCorrect": false, "effect": ""},
        {"particle": "wrong expression 2", "meaning": "Vietnamese", "outcome": "Different specific consequence", "isCorrect": false, "effect": ""},
        {"particle": "wrong expression 3", "meaning": "Vietnamese", "outcome": "Different specific consequence", "isCorrect": false, "effect": ""}
      ],
      "technicalHint": "", "isFinalBoss": false
    },
    {"missionCode": "STAGE-2", "baseVerb": "___", "narrative": "...", "choices": [...], "technicalHint": "", "isFinalBoss": false},
    {"missionCode": "STAGE-3", "baseVerb": "___", "narrative": "...", "choices": [...], "technicalHint": "", "isFinalBoss": false},
    {"missionCode": "STAGE-4", "baseVerb": "___", "narrative": "...", "choices": [...], "technicalHint": "", "isFinalBoss": false},
    {"missionCode": "STAGE-5", "baseVerb": "___", "narrative": "...", "choices": [...], "technicalHint": "", "isFinalBoss": true}
  ]
}
`;

    try {
      this.logger.log('Generating story arc via Groq...');
      const result = await this.groqProvider.generateArc(arcPrompt);
      return processArc(result);
    } catch (groqErr: unknown) {
      const groqMsg =
        groqErr instanceof Error ? groqErr.message : String(groqErr);
      this.logger.warn(`Groq arc failed: ${groqMsg}`);
      throw new Error(`Story arc generation failed: ${groqMsg}`);
    }
  }

  private getHardcodedFallback(stage: number): SynapseScenario {
    const fallbacks: SynapseScenario[] = [
      {
        missionCode: `FALLBACK-${stage}`,
        baseVerb: 'break',
        narrative:
          'Hệ thống liên lạc với AI trung tâm đã sập. Cảnh cửa duy nhất trước mặt bạn đang bị kẹt cứng, xung quanh là tiếng còi báo động chói tai. Bạn phải...',
        choices: [
          {
            particle: 'down',
            meaning: 'to smash or demolish something',
            outcome:
              'Bạn phá tung cánh cửa, tạo tiếng động lớn đánh thức bầy drone bảo vệ. Chúng tràn vào và tiêu diệt bạn ngay lập tức.',
            isCorrect: false,
          },
          {
            particle: 'in',
            meaning: 'to enter a building by force',
            outcome:
              'Bạn cố gắng đột nhập vào hệ thống mạng nội bộ. Mật khẩu được bẻ khóa thành công, cửa tự động mở ra.',
            isCorrect: true,
          },
          {
            particle: 'out',
            meaning: 'to escape from a place',
            outcome:
              'Bạn cố gắng phá cửa thoát ra ngoài nhưng lại kích hoạt hệ thống tự hủy. Căn phòng nổ tung.',
            isCorrect: false,
          },
          {
            particle: 'up',
            meaning: 'to separate into pieces',
            outcome:
              'Bạn đập vỡ bảng điều khiển, khiến toàn bộ hệ thống điện bị đoản mạch. Cửa bị khóa vĩnh viễn.',
            isCorrect: false,
          },
        ],
        technicalHint: 'System Override - Connection Lost',
      },
      {
        missionCode: `FALLBACK-${stage}`,
        baseVerb: 'run',
        narrative:
          'Sau khi qua được cửa, bạn phát hiện cốt lõi dữ liệu (data core) của Megacorp đang bị rò rỉ chất làm mát cực độc. Khí gas màu xanh lục tràn ngập không gian. Bạn phải...',
        choices: [
          {
            particle: 'away',
            meaning: 'to leave or escape from a place',
            outcome:
              'Bạn bỏ chạy, nhưng khí độc lan quá nhanh. Mắt bạn mờ đi trước khi kịp tìm thấy lối thoát.',
            isCorrect: false,
          },
          {
            particle: 'into',
            meaning: 'to meet someone by chance',
            outcome:
              'Bạn chạy thẳng vào làn khí và tình cờ va phải một bộ đồ bảo hộ (hazmat suit) treo trên tường. Bạn sống sót.',
            isCorrect: true,
          },
          {
            particle: 'out of',
            meaning: 'to have nothing left',
            outcome:
              'Bạn cạn kiệt oxy trong bình thở phụ. Hệ thống hô hấp sụp đổ.',
            isCorrect: false,
          },
          {
            particle: 'over',
            meaning: 'to hit with a vehicle',
            outcome:
              'Bạn trượt chân ngã xuống băng chuyền và bị cỗ máy nghiền nát.',
            isCorrect: false,
          },
        ],
        technicalHint: 'Hazardous Environment',
      },
      {
        missionCode: `FALLBACK-${stage}`,
        baseVerb: 'look',
        narrative:
          'Bạn tìm thấy thiết bị lưu trữ, nhưng nó được bảo vệ bởi hàng ngàn dòng code độc mã hóa liên tục thay đổi. Để lấy được mật mã gốc, bạn phải...',
        choices: [
          {
            particle: 'after',
            meaning: 'to take care of someone/something',
            outcome:
              'Bạn cố gắng bảo vệ ổ cứng nhưng bị firewall đốt cháy bảng mạch của thiết bị.',
            isCorrect: false,
          },
          {
            particle: 'for',
            meaning: 'to search for something',
            outcome:
              'Bạn mải mê tìm kiếm lỗ hổng thủ công, tốn quá nhiều thời gian và bị AI phát hiện.',
            isCorrect: false,
          },
          {
            particle: 'into',
            meaning: 'to investigate or examine',
            outcome:
              'Bạn điều tra sâu vào cấu trúc vòng lặp của mã độc, tìm thấy một cửa hậu (backdoor) và trích xuất thành công dữ liệu.',
            isCorrect: true,
          },
          {
            particle: 'up',
            meaning: 'to search for information in a book/database',
            outcome:
              'Bạn tra cứu từ điển mã độc trên mạng nội bộ, kích hoạt chuông báo động cấp cao nhất.',
            isCorrect: false,
          },
        ],
        technicalHint: 'Digital Infiltration',
      },
    ];

    const fallbackIndex = (stage - 1) % fallbacks.length;
    return fallbacks[fallbackIndex];
  }
}
