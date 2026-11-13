
(() => {
    const MEAT_MAX_TOTAL = 15000;
    const MEAT_RECORD_LIMIT = 200000; 
    const MEAT_RECORD_MAX = MEAT_RECORD_LIMIT - 1;
    const MEAT_STAMP_STEP = 1000;
    const MEAT_COOLDOWN_MS = 15 * 60 * 1000;
    const MEAT_STAMP_IMAGE = 'meat_stamp.png';
    const MEAT_PILE_UNIT = 100;
    const MEAT_PILE_FONT_SIZE = 42;
    const MEAT_PILE_ANIMATION_MAX = 40;
    const MEAT_FIND_CHANCE = 0.30;
    const MEAT_FIND_UNFOUND_WEIGHT = 1.35;
    let meatTimerInterval = null;
    let meatPileAnimationFrame = null;
    let meatFindHitbox = null;
    let meatPanelView = 'rewards';

    const MEAT_STAMP_REWARDS = [
        { amount: 3000,  itemId: 'meat3000',  name: '勲章',           file: 'meat_3000.png',  type: 'acc' },
        { amount: 6000,  itemId: 'meat6000',  name: 'マウスカーソル', file: 'meat_6000.png',  type: 'acc' },
        { amount: 9000,  itemId: 'meat9000',  name: '山盛りの肉',     file: 'meat_9000.png',  type: 'bg' },
        { amount: 12000, itemId: 'meat12000', name: '肉集め中',     file: 'meat_12000.png', type: 'acc' },
        { amount: 15000, itemId: 'meat15000', name: '認証画面',       file: 'meat_15000.png', type: 'acc' }
    ];

    const MEAT_REPORT_LINES = [
        { min: 0,     img: 'lancelot_1.png', msg: '肉集めお疲れさま、団長。着実に増えているな。古戦場の滑り出しは順調だろうか。' },
        { min: 800,   img: 'lancelot_1.png', msg: 'こんなにいっぱいあったら、少しビストロフェードラッヘにおすそ分けしても……冗談だよ。' },
        { min: 1600,  img: 'lancelot_5.png', msg: 'それにしても、これだけの肉をどこに置いているんだ……？艇にはまだ俺の知らない空間がありそうだな。' },
        { min: 2400,  img: 'lancelot_6.png', msg: 'ヴェインなら美味しく調理してくれそうだと思わないか？頼んでみるか……' },
        { min: 3200,  img: 'lancelot_1.png', msg: '古戦場の勲章は、いったい誰が授けてくれているんだろうな？古戦場は謎だらけだ。' },
        { min: 4000,  img: 'lancelot_3.png', msg: 'パーシヴァルに頼んだら全部焼いてくれるかな。ふふっ、バーベキューみたいだ。' },
        { min: 4800,  img: 'lancelot_5.png', msg: '肉の数を数えるのもなかなか大変そうだな。そもそも誰が捌いているんだ……？' },
        { min: 5600,  img: 'lancelot_1.png', msg: '団長は肉集めが好きなのか？……いや、仕事だからやっているんだよな。すまない。' },
        { min: 6400,  img: 'lancelot_3.png', msg: 'これだけ集めれば、戦いの準備もかなり進んだんじゃないか？本戦が楽しみだな！' },
        { min: 7200,  img: 'lancelot_6.png', msg: 'ジークフリートさん、そんな大きなお肉をひと口で！俺も見習います！' },
        { min: 8000,  img: 'lancelot_8.png', msg: '肉、肉、肉……見ているだけで少し腹が減ってきたな。' },
        { min: 8800,  img: 'lancelot_1.png', msg: '俺は甘いものが大好きだが、肉も大好物だ。もっとも、魔物の肉はそんなに食べないが……' },
        { min: 9600,  img: 'lancelot_4.png', msg: 'かなり集めたな……。今回はどれだけ古戦場を走るつもりなんだ？俺も付き合うぞ！' },
        { min: 10400, img: 'lancelot_6.png', msg: 'さすがだな、団長！この調子なら最後のスタンプまで届きそうだな！' },
        { min: 11200, img: 'lancelot_1.png', msg: '肉は多くても少なくても悲しくなるよな。計画が大変だ。いつもお疲れ様！' },
        { min: 12000, img: 'lancelot_5.png', msg: '食べきれなかった肉はどこへ行っているのだろうか。冷凍して保存しておきたいものだが……' },
        { min: 12800, img: 'lancelot_8.png', msg: '同じ動作をしていると眠くなってくるよな……俺もまだ鍛錬が足りないのか……？' },
        { min: 13600, img: 'lancelot_1.png', msg: '団長とこうして進捗を確認するのも、古戦場の楽しみのひとつかもしれないな。' },
        { min: 14400, img: 'lancelot_3.png', msg: '団長、休憩の予定はないか？お茶をするなら、ぜひ俺も呼んでくれると嬉しいぞ！' },
        { min: 15000, img: 'lancelot_1.png', msg: '本戦の準備はばっちりだな、団長。日頃の鍛錬の成果を見せる時だ。' },
        { min: 20000, img: 'lancelot_6.png', msg: '20,000個……！スタンプラリーは終わったのに、まだこんなに集めているのか。団長の本気には驚かされるな！' },
        { min: 30000, img: 'lancelot_4.png', msg: '30,000個！？団長、これはもう肉の山というより山脈だな……！本戦前に埋もれないでくれよ。' }
    ];

    const MEAT_FIND_ITEMS = [
        { key: 'pudding',    emoji: '🍮', name: 'プリン',   img: 'lancelot_6.png', rewardItemId: 'meatFindPudding',    rewardName: 'プリンの髪飾り',       msg: 'これはヴェイン特製のプリン！どうして肉の中に……？団長、これは俺が預かってもいいだろうか。' },
        { key: 'crab',       emoji: '🦀', name: 'カニ',     img: 'lancelot_4.png', rewardItemId: 'meatFindCrab',       rewardName: 'カニの髪飾り',         msg: '団長、カニだぞ！どこから紛れ込んだんだ？……なぜかカニを見かけると嬉しくなるな……' },
        { key: 'strawberry', emoji: '🍓', name: 'イチゴ',   img: 'lancelot_3.png', rewardItemId: 'meatFindStrawberry', rewardName: 'イチゴの髪飾り',       msg: 'イチゴだ！パーシヴァルに持って行ったら喜ぶかな？それとも俺がつまみ食いしてしまおうか。' },
        { key: 'sword',      emoji: '🐶', name: '犬',       img: 'lancelot_6.png', rewardItemId: 'meatFindSword',      rewardName: '双剣の髪飾り',         msg: '団長、犬が紛れ込んでいるぞ！……ふふっ、可愛いな！' },
        { key: 'dragon',     emoji: '🐉', name: '竜',       img: 'lancelot_5.png', rewardItemId: 'meatFindDragon',     rewardName: 'ドラゴンの髪飾り',     msg: 'ドラゴンが紛れ込んでいるぞ……。ジークフリートさんなら何か知っているかもしれないな。' },
        { key: 'snow',       emoji: '❄️', name: '雪の結晶', img: 'lancelot_3.png', rewardItemId: 'meatFindSnow',       rewardName: '雪の結晶の髪飾り',     msg: 'ふふっ、それは俺のいたずらだ。雪の結晶だぞ！……びっくりしたか？' }
    ];

    function ensureMeatState() {
        let changed = false;

        if (!Number.isSafeInteger(state.meatTotal) || state.meatTotal < 0) {
            state.meatTotal = 0;
            changed = true;
        } else if (state.meatTotal >= MEAT_RECORD_LIMIT) {
            state.meatTotal = MEAT_RECORD_MAX;
            changed = true;
        }

        if (!Number.isSafeInteger(state.highestMeatTotal) || state.highestMeatTotal < 0) {
            state.highestMeatTotal = state.meatTotal;
            changed = true;
        } else if (state.highestMeatTotal >= MEAT_RECORD_LIMIT) {
            state.highestMeatTotal = MEAT_RECORD_MAX;
            changed = true;
        }

        if (!Number.isSafeInteger(state.meatReportCount) || state.meatReportCount < 0) {
            state.meatReportCount = 0;
            changed = true;
        }
        if (!state.meatRewardReceived || typeof state.meatRewardReceived !== 'object' || Array.isArray(state.meatRewardReceived)) {
            state.meatRewardReceived = {};
            changed = true;
        }
        if (!state.meatPendingRewards || typeof state.meatPendingRewards !== 'object' || Array.isArray(state.meatPendingRewards)) {
            state.meatPendingRewards = {};
            changed = true;
        }
        if (!Number.isSafeInteger(state.meatLastReportTime) || state.meatLastReportTime < 0) {
            state.meatLastReportTime = 0;
            changed = true;
        }

        if (!state.meatCollection || typeof state.meatCollection !== 'object' || Array.isArray(state.meatCollection)) {
            state.meatCollection = {};
            changed = true;
        }
        if (typeof state.meatCurrentFind !== 'string') {
            state.meatCurrentFind = '';
            changed = true;
        }
        if (!Number.isSafeInteger(state.meatFindReportCounter) || state.meatFindReportCounter < 0) {
            state.meatFindReportCounter = 0;
            changed = true;
        }
        if (typeof state.meatCompleteCelebrated !== 'boolean') {
            state.meatCompleteCelebrated = false;
            changed = true;
        }
        if (!Number.isSafeInteger(state.meatGiftCount) || state.meatGiftCount < 0) {
            state.meatGiftCount = 0;
            changed = true;
        }
        if (!Number.isSafeInteger(state.meatBoxProgress) || state.meatBoxProgress < 0) {
            state.meatBoxProgress = 0;
            changed = true;
        }

        return changed;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function findItemById(id) {
        if (typeof ITEM_DB === 'undefined') return null;
        for (const category of ['setup', 'tops', 'bottoms', 'acc', 'bg']) {
            if (!ITEM_DB[category]) continue;
            const found = ITEM_DB[category].find(item => item.id === id);
            if (found) return found;
        }
        return null;
    }

    function ensureMeatThemeStyle() {
        if (document.getElementById('meat-mode-theme-style')) return;
        const style = document.createElement('style');
        style.id = 'meat-mode-theme-style';
        style.textContent = `
            body.meat-mode-page { background-color: var(--meat-bg, #ffe4eb) !important; }
            #game-container.mode-top.meat-mode-active { background-color: var(--meat-bg, #ffe4eb) !important; }
            #game-container.mode-top.meat-mode-active #content-wrapper,
            #game-container.mode-top.meat-mode-active #ui-area,
            #game-container.mode-top.meat-mode-active #section-top { background-color: var(--meat-bg, #ffe4eb) !important; }

            .meat-rally-card {
                background: rgba(255,255,255,0.76);
                border: 1px solid #e8a9b7;
                border-radius: 12px;
                padding: 12px;
                box-sizing: border-box;
            }
            .meat-progress-bar {
                width: 100%;
                height: 12px;
                background: #f1d5dc;
                border-radius: 999px;
                overflow: hidden;
                margin-top: 8px;
            }
            .meat-progress-fill {
                height: 100%;
                background: #c0392b;
                border-radius: 999px;
                transition: width .2s ease;
            }
            .meat-next-reward {
                border: 2px solid #c0392b;
                background: #fff4f5;
                box-shadow: 0 2px 8px rgba(192,57,43,.12);
            }
            .meat-pending-notice {
                border: 2px solid #e68a19;
                background: #fff8eb;
                color: #7a4a0b;
            }

            .meat-stamp-grid {
                display: grid;
                grid-template-columns: repeat(5, minmax(0, 1fr));
                gap: 7px;
            }
            .meat-stamp-cell {
                min-width: 0;
                min-height: 64px;
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 2px;
                box-sizing: border-box;
                font-weight: bold;
                position: relative;
            }
            .meat-stamp-cell.done { border: 2px solid #56a66a; background: #eef9f0; color: #26723b; }
            .meat-stamp-cell.next { border: 3px solid #c0392b; background: #fff0f2; color: #9f2f29; box-shadow: 0 0 0 3px rgba(192,57,43,.08); }
            .meat-stamp-cell.pending { border: 3px solid #e68a19; background: #fff7e8; color: #9a5b0a; box-shadow: 0 0 0 3px rgba(230,138,25,.10); }
            .meat-stamp-cell.locked { border: 2px solid #d8dee5; background: #f8fafc; color: #94a3b8; }
            .meat-stamp-gift-button {
                position: absolute;
                top: -10px;
                right: -8px;
                width: 28px;
                height: 28px;
                padding: 0;
                border: 0;
                border-radius: 999px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffffff;
                box-shadow: 0 2px 7px rgba(0,0,0,.18);
                font-size: 15px;
                line-height: 1;
                cursor: pointer;
                z-index: 2;
            }
            .meat-stamp-gift-button:hover {
                background: #fff6dc;
                transform: scale(1.06);
            }
            .meat-stamp-gift-button:active {
                transform: scale(.94);
            }
            .meat-reward-preview-overlay {
                position: fixed;
                inset: 0;
                z-index: 21000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
                background: rgba(15, 23, 42, .55);
            }
            .meat-reward-preview-card {
                width: min(360px, 92vw);
                background: #fff;
                border-radius: 16px;
                padding: 20px;
                box-sizing: border-box;
                text-align: center;
                box-shadow: 0 16px 45px rgba(0,0,0,.24);
            }
            .meat-reward-preview-title {
                margin: 0 0 12px;
                color: #8e2d41;
                font-size: 17px;
                font-weight: 900;
            }
            .meat-reward-preview-image {
                width: 150px;
                height: 150px;
                object-fit: contain;
                display: block;
                margin: 0 auto 12px;
                border-radius: 12px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
            }
            .meat-reward-preview-name {
                font-size: 18px;
                font-weight: 900;
                color: #334155;
                margin-bottom: 5px;
            }
            .meat-reward-preview-meta {
                font-size: 12px;
                color: #64748b;
                line-height: 1.7;
            }
            .meat-reward-preview-status {
                margin-top: 10px;
                padding: 8px 10px;
                border-radius: 8px;
                background: #f8fafc;
                color: #475569;
                font-size: 12px;
                font-weight: bold;
            }
            .meat-reward-preview-close {
                width: 100%;
                margin-top: 16px;
                background: #8e2d41;
            }
            .meat-stamp-image {
                width: 34px;
                height: 34px;
                object-fit: contain;
                display: block;
                pointer-events: none;
                user-select: none;
            }
            .meat-stamp-cell.done .meat-stamp-image { opacity: 1; filter: none; }
            .meat-stamp-cell.pending .meat-stamp-image { opacity: .72; filter: none; }
            .meat-stamp-cell.next .meat-stamp-image { opacity: .35; filter: none; }
            .meat-stamp-cell.locked .meat-stamp-image { opacity: .13; filter: grayscale(1); }
            .meat-stamp-fallback {
                display: none;
                font-size: 18px;
                line-height: 1;
            }
            .meat-stamp-next-tag {
                position: absolute;
                top: -9px;
                left: 50%;
                transform: translateX(-50%);
                background: #c0392b;
                color: white;
                font-size: 8px;
                line-height: 1;
                padding: 3px 5px;
                border-radius: 999px;
                letter-spacing: .04em;
            }

            .meat-reward-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
            }
            .meat-reward-item {
                display: grid;
                grid-template-columns: 48px 1fr auto;
                align-items: center;
                gap: 9px;
                border-radius: 10px;
                padding: 10px;
                border: 1px solid #d8dee5;
                background: rgba(248,250,252,.82);
                box-sizing: border-box;
            }
            .meat-reward-item.done { border-color: #86c694; background: rgba(239,250,241,.82); }
            .meat-reward-item.next { border: 2px solid #c0392b; background: rgba(255,241,243,.84); box-shadow: 0 2px 8px rgba(192,57,43,.10); }
            .meat-reward-item.pending { border: 2px solid #e68a19; background: rgba(255,248,235,.84); box-shadow: 0 2px 8px rgba(230,138,25,.10); }
            .meat-reward-icon {
                width: 46px;
                height: 46px;
                border-radius: 9px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,.9);
                border: 1px solid rgba(0,0,0,.07);
                overflow: hidden;
            }
            .meat-reward-icon img {
                width: 100%;
                height: 100%;
                object-fit: contain;
                display: block;
            }
            .meat-reward-icon-fallback {
                font-size: 22px;
                line-height: 1;
            }
            .meat-reward-status {
                font-size: 11px;
                font-weight: bold;
                white-space: nowrap;
                text-align: right;
            }

            .meat-mode-root {
                position: relative;
                isolation: isolate;
            }
            .meat-pile-background {
                position: absolute;
                inset: 0;
                z-index: 0;
                overflow: hidden;
                pointer-events: none;
                border-radius: 12px;
            }
            .meat-pile-canvas {
                display: block;
                width: 100%;
                height: 100%;
                opacity: .98;
            }
            .meat-mode-foreground {
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                gap: 12px;
                width: 100%;
            }
            .meat-pile-view {
                position: relative;
                height: 430px;
                min-height: 340px;
                overflow: hidden;
                border-radius: 12px;
                background: rgba(255, 244, 235, .98);
                border: 1px solid rgba(142,45,65,.18);
                box-shadow: inset 0 -18px 32px rgba(142,45,65,.06);
            }
            .meat-pile-view .meat-pile-canvas {
                opacity: 1;
                cursor: pointer;
            }
            .meat-view-switch {
                padding: 6px 10px;
                font-size: 11px;
                background-color: #b97888;
                box-shadow: none;
                white-space: nowrap;
            }
            .meat-find-grid {
                display: grid;
                grid-template-columns: repeat(6, minmax(0, 1fr));
                gap: 6px;
            }
            .meat-find-cell {
                height: 44px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,.74);
                border: 1px solid rgba(142,45,65,.18);
                font-size: 23px;
                box-sizing: border-box;
            }
            .meat-find-cell.locked {
                color: #b6a2a8;
                font-size: 17px;
                background: rgba(255,255,255,.48);
            }

            .meat-complete-overlay {
                position: fixed;
                inset: 0;
                z-index: 20000;
                overflow: hidden;
                pointer-events: none;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 235, 190, 0);
                animation: meatCompleteFlash 3.6s ease-out forwards;
            }
            .meat-complete-title {
                position: relative;
                z-index: 3;
                text-align: center;
                padding: 0;
                background: transparent;
                border: none;
                box-shadow: none;
                transform: scale(.1) rotate(-7deg);
                opacity: 0;
                animation: meatCompleteTitle 3.2s cubic-bezier(.2,.9,.2,1) .42s forwards;
            }
            .meat-complete-title .big {
                display: block;
                font-size: clamp(42px, 10vw, 92px);
                line-height: .95;
                font-weight: 1000;
                color: #c0392b;
                letter-spacing: -.04em;
                text-shadow: 0 3px 0 #fff7d6, 0 0 14px rgba(255,255,255,.95), 0 8px 18px rgba(192,57,43,.24);
            }
            .meat-complete-title .small {
                display: block;
                margin-top: 8px;
                font-size: clamp(16px, 3.4vw, 28px);
                font-weight: 900;
                color: #8e2d41;
                letter-spacing: .08em;
            }
            .meat-complete-drop {
                position: absolute;
                top: -80px;
                z-index: 2;
                font-size: 44px;
                line-height: 1;
                animation-name: meatCompleteDrop;
                animation-timing-function: cubic-bezier(.18,.74,.28,1);
                animation-fill-mode: forwards;
            }
            .meat-stamp-cell.meat-complete-pulse {
                animation: meatStampCompletePulse .52s ease-out both;
            }
            #game-container.meat-complete-burst {
                animation: meatContainerBurst .85s ease-out;
            }
            @keyframes meatCompleteFlash {
                0%   { background: rgba(255,255,255,0); }
                8%   { background: rgba(255,255,255,.92); }
                18%  { background: rgba(255,210,90,.28); }
                28%  { background: rgba(255,255,255,.68); }
                42%  { background: rgba(255,190,95,.18); }
                100% { background: rgba(255,235,190,0); }
            }
            @keyframes meatCompleteTitle {
                0%   { transform: scale(.1) rotate(-7deg); opacity: 0; }
                18%  { transform: scale(1.18) rotate(3deg); opacity: 1; }
                30%  { transform: scale(.96) rotate(-1deg); opacity: 1; }
                42%  { transform: scale(1.03) rotate(0deg); opacity: 1; }
                80%  { transform: scale(1) rotate(0deg); opacity: 1; }
                100% { transform: scale(1.08) rotate(0deg); opacity: 0; }
            }
            @keyframes meatCompleteDrop {
                0%   { transform: translateY(-12vh) rotate(0deg) scale(.75); opacity: 0; }
                8%   { opacity: 1; }
                82%  { opacity: 1; }
                100% { transform: translateY(112vh) rotate(720deg) scale(1.15); opacity: 0; }
            }
            @keyframes meatStampCompletePulse {
                0%   { transform: scale(1); box-shadow: none; }
                38%  { transform: scale(1.24); box-shadow: 0 0 0 6px rgba(255,193,7,.22), 0 0 22px rgba(255,152,0,.65); }
                100% { transform: scale(1); box-shadow: none; }
            }
            @keyframes meatContainerBurst {
                0%   { transform: scale(1); }
                25%  { transform: scale(1.012); }
                48%  { transform: scale(.996); }
                72%  { transform: scale(1.005); }
                100% { transform: scale(1); }
            }

            @media (max-width: 768px) {
                .meat-pile-view { height: 360px; min-height: 300px; }
                .meat-reward-item { grid-template-columns: 42px 1fr; }
                .meat-reward-status { grid-column: 2; text-align: left; }
                .meat-reward-icon { width: 40px; height: 40px; }
            }
        `;
        document.head.appendChild(style);
    }

    function isMeatPanelOpen() {
        const panel = document.getElementById('meat-mode-panel');
        return !!panel && panel.style.display !== 'none';
    }

    function applyMeatTheme(active) {
        ensureMeatThemeStyle();
        const gc = document.getElementById('game-container');
        if (active) {
            updateMeatThemeColor();
            document.body.classList.add('meat-mode-page');
            if (gc) gc.classList.add('meat-mode-active');
        } else {
            document.body.classList.remove('meat-mode-page');
            if (gc) gc.classList.remove('meat-mode-active');
        }
    }

    function getMeatCooldownRemaining() {
        if (!state.meatLastReportTime) return 0;
        return Math.max(0, MEAT_COOLDOWN_MS - (Date.now() - state.meatLastReportTime));
    }

    function updateMeatCooldownUI() {
        const button = document.getElementById('btn-meat-report');
        const text = document.getElementById('meat-cooldown-text');
        if (!button || !text) return;

        const remaining = getMeatCooldownRemaining();
        if (remaining <= 0) {
            button.disabled = false;
            text.innerText = '肉の個数を報告できるぞ！';
            if (meatTimerInterval) {
                clearInterval(meatTimerInterval);
                meatTimerInterval = null;
            }
            return;
        }

        const min = Math.floor(remaining / 1000 / 60);
        const sec = Math.floor((remaining / 1000) % 60);
        button.disabled = true;
        text.innerText = `次の肉集め報告まで: ${min}分 ${sec}秒`;
    }

    function startMeatCooldownTimer() {
        if (meatTimerInterval) {
            clearInterval(meatTimerInterval);
            meatTimerInterval = null;
        }
        updateMeatCooldownUI();
        if (getMeatCooldownRemaining() > 0) {
            meatTimerInterval = setInterval(updateMeatCooldownUI, 1000);
        }
    }

    function stopMeatCooldownTimer() {
        if (meatTimerInterval) {
            clearInterval(meatTimerInterval);
            meatTimerInterval = null;
        }
    }

    function setMeatLancelotMessage(msg, img = 'lancelot_1.png') {
        currentLancelotImg = img;
        setLancelotMessage(msg);
        updateLancelotImage();
    }

    function getReportLineForTotal(total) {
        let selected = MEAT_REPORT_LINES[0];
        for (const line of MEAT_REPORT_LINES) {
            if (total >= line.min) selected = line;
            else break;
        }
        return selected;
    }

    function hexToRgb(hex) {
        const value = hex.replace('#', '');
        return {
            r: parseInt(value.slice(0, 2), 16),
            g: parseInt(value.slice(2, 4), 16),
            b: parseInt(value.slice(4, 6), 16)
        };
    }

    function mixColor(a, b, t) {
        const ca = hexToRgb(a);
        const cb = hexToRgb(b);
        const lerp = (x, y) => Math.round(x + (y - x) * t);
        return `rgb(${lerp(ca.r, cb.r)}, ${lerp(ca.g, cb.g)}, ${lerp(ca.b, cb.b)})`;
    }

    function getMeatThemeColor(total) {
        const stops = [
            { value: 0,     color: '#ffe4eb' },
            { value: 3000,  color: '#ffdde5' },
            { value: 6000,  color: '#ffd6dc' },
            { value: 9000,  color: '#facfc8' },
            { value: 12000, color: '#f5c5b1' },
            { value: 15000, color: '#efbd95' }
        ];

        const value = Math.max(0, Math.min(MEAT_MAX_TOTAL, total));
        for (let i = 0; i < stops.length - 1; i++) {
            const current = stops[i];
            const next = stops[i + 1];
            if (value <= next.value) {
                const t = (value - current.value) / (next.value - current.value);
                return mixColor(current.color, next.color, t);
            }
        }
        return stops[stops.length - 1].color;
    }

    function updateMeatThemeColor() {
        document.body.style.setProperty('--meat-bg', getMeatThemeColor(state.meatTotal));
    }

    function getCurrentFindDefinition() {
        return MEAT_FIND_ITEMS.find(item => item.key === state.meatCurrentFind) || null;
    }

    function getUnfoundMeatItems() {
        return MEAT_FIND_ITEMS.filter(item => !state.meatCollection[item.key]);
    }

    function maybeSpawnMeatFind() {
        if (state.meatTotal < 800) return false;
        if (Math.random() >= MEAT_FIND_CHANCE) return false;

        const weighted = MEAT_FIND_ITEMS.map(item => ({
            item,
            weight: state.meatCollection[item.key] ? 1 : MEAT_FIND_UNFOUND_WEIGHT
        }));
        const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const entry of weighted) {
            roll -= entry.weight;
            if (roll < 0) {
                state.meatCurrentFind = entry.item.key;
                return true;
            }
        }

        state.meatCurrentFind = weighted[weighted.length - 1].item.key;
        return true;
    }

    function collectCurrentMeatFind() {
        const item = getCurrentFindDefinition();
        if (!item) return;

        const firstDiscovery = !state.meatCollection[item.key];
        let message = item.msg;
        let unlockedReward = false;

        state.meatCollection[item.key] = true;
        state.meatCurrentFind = '';

        if (firstDiscovery && item.rewardItemId) {
            const rewardItem = findItemById(item.rewardItemId);

            if (rewardItem && rewardItem.type === 'acc') {
                if (!state.unlocked || typeof state.unlocked !== 'object' || Array.isArray(state.unlocked)) {
                    state.unlocked = {};
                }
                state.unlocked[item.rewardItemId] = true;
                unlockedReward = true;
                message += ` 「${item.rewardName}」を手に入れたぞ！`;
            } else {
                console.warn(`[肉のみつけもの] ${item.rewardItemId} のアクセサリー定義が見つかりません。`);
            }
        }

        state.lastMeatReaction = { img: item.img, msg: message };

        saveGame();
        if (unlockedReward && typeof renderItems === 'function') {
            renderItems();
        }
        renderMeatPanel();
        setMeatLancelotMessage(message, item.img);
    }

    function replayMeatFind(key) {
        const item = MEAT_FIND_ITEMS.find(candidate => candidate.key === key);
        if (!item || !state.meatCollection[item.key]) return;

        state.lastMeatReaction = {
            img: item.img,
            msg: item.msg
        };

        setMeatLancelotMessage(item.msg, item.img);
    }

    function renderMeatFindCollection() {
        const foundCount = MEAT_FIND_ITEMS.filter(item => !!state.meatCollection[item.key]).length;
        const cells = MEAT_FIND_ITEMS.map(item => {
            const found = !!state.meatCollection[item.key];
            const replayAttrs = found
                ? ` role="button" tabindex="0" onclick="replayMeatFind('${item.key}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();replayMeatFind('${item.key}');}" style="cursor:pointer;"`
                : '';
            return `<div class="meat-find-cell${found ? '' : ' locked'}" title="${found ? `${escapeHtml(item.name)}（タップでセリフ再生）` : '？？？'}"${replayAttrs}>${found ? item.emoji : '？'}</div>`;
        }).join('');

        return `
            <div class="meat-rally-card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <strong style="font-size:12px; color:#8e2d41;">みつけもの</strong>
                    <span style="font-size:10px; color:#8e2d41; font-weight:bold;">${foundCount} / ${MEAT_FIND_ITEMS.length}</span>
                </div>
                <div class="meat-find-grid">${cells}</div>
            </div>
        `;
    }

    function getProgressTotal() {
        return Math.min(state.meatTotal, MEAT_MAX_TOTAL);
    }

    function getStampCount() {
        return Math.min(15, Math.floor(getProgressTotal() / MEAT_STAMP_STEP));
    }

    function getRewardTypeLabel(type) {
        const labels = { setup: 'セットアップ', tops: 'トップス', bottoms: 'ボトムス', acc: 'アクセサリー', bg: '背景' };
        return labels[type] || type;
    }

    function getPendingRewards() {
        return MEAT_STAMP_REWARDS.filter(reward => {
            const key = `stamp_${reward.amount}`;
            return !!state.meatPendingRewards[key] && !state.meatRewardReceived[key];
        });
    }

    function hasPendingRewards() {
        return getPendingRewards().length > 0;
    }

    function getNextReward() {
        return MEAT_STAMP_REWARDS.find(reward => {
            const key = `stamp_${reward.amount}`;
            return !state.meatRewardReceived[key] && !state.meatPendingRewards[key];
        }) || null;
    }

    function getRewardItemDefinitionState(reward) {
        const item = findItemById(reward.itemId);
        if (!item) return { item: null, valid: false };
        const valid = item.name === reward.name && item.file === reward.file && item.type === reward.type;
        return { item, valid };
    }

    function syncExistingRewardState() {
        let changed = false;

        MEAT_STAMP_REWARDS.forEach(reward => {
            const key = `stamp_${reward.amount}`;

            if (state.meatRewardReceived[key]) {
                if (state.meatPendingRewards[key]) {
                    delete state.meatPendingRewards[key];
                    changed = true;
                }
                return;
            }

            if (state.unlocked && state.unlocked[reward.itemId]) {
                state.meatRewardReceived[key] = true;
                delete state.meatPendingRewards[key];
                changed = true;
                return;
            }

            if (state.meatTotal >= reward.amount && !state.meatPendingRewards[key]) {
                state.meatPendingRewards[key] = true;
                changed = true;
            }
        });

        return changed;
    }

    function confirmPendingRewards(reportTotal, includeResultLines = true) {
        const result = { changed: false, unlockedSomething: false, lines: [] };

        MEAT_STAMP_REWARDS.forEach(reward => {
            const key = `stamp_${reward.amount}`;

            if (!state.meatPendingRewards[key] || state.meatRewardReceived[key]) return;
            if (reportTotal < reward.amount) return;

            const definition = getRewardItemDefinitionState(reward);

            if (!definition.item) {
                if (includeResultLines) {
                    result.lines.push(`${reward.amount.toLocaleString()}個の報酬「${reward.name}」は items.js への追加後、次の報告で解放できます。`);
                }
                return;
            }

            if (!definition.valid) {
                console.warn(`[肉スタンプラリー] ${reward.itemId} の items.js 定義が meat.js の想定と一致しません。`, definition.item);
                if (includeResultLines) {
                    result.lines.push(`${reward.amount.toLocaleString()}個の報酬「${reward.name}」の定義を確認してくれ。`);
                }
                return;
            }

            if (!state.unlocked[reward.itemId]) {
                state.unlocked[reward.itemId] = true;
                result.unlockedSomething = true;
            }

            state.meatRewardReceived[key] = true;
            delete state.meatPendingRewards[key];
            result.changed = true;

            if (includeResultLines) {
                result.lines.push(`${reward.amount.toLocaleString()}個の報酬「${reward.name}」を解放！`);
            }
        });

        return result;
    }

    function queueReachedRewards(includeResultLines = true) {
        const result = { changed: false, lines: [] };

        MEAT_STAMP_REWARDS.forEach(reward => {
            const key = `stamp_${reward.amount}`;

            if (state.meatTotal < reward.amount) return;
            if (state.meatRewardReceived[key] || state.meatPendingRewards[key]) return;

            state.meatPendingRewards[key] = true;
            result.changed = true;

            if (includeResultLines) {
                result.lines.push(`${reward.amount.toLocaleString()}個達成！ 報酬「${reward.name}」は次の報告で解放できます。`);
            }
        });

        return result;
    }

    function cancelInvalidPendingRewards() {
        let changed = false;

        MEAT_STAMP_REWARDS.forEach(reward => {
            const key = `stamp_${reward.amount}`;
            if (state.meatPendingRewards[key] && state.meatTotal < reward.amount) {
                delete state.meatPendingRewards[key];
                changed = true;
            }
        });

        return changed;
    }

    function renderRewardIcon(reward) {
        return `
            <div class="meat-reward-icon">
                <img
                    src="${escapeHtml(typeof getItemImagePath === 'function' ? getItemImagePath(reward.file) : reward.file)}"
                    alt="${escapeHtml(reward.name)}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"
                >
                <span class="meat-reward-icon-fallback" style="display:none;">🎁</span>
            </div>
        `;
    }

    function getMeatPieceCount() {
        return Math.floor(state.meatTotal / MEAT_PILE_UNIT);
    }

    function meatHash(seed) {
        const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return x - Math.floor(x);
    }

    function setupMeatPileCanvas(canvas) {
        const host = canvas.parentElement;
        const rect = host ? host.getBoundingClientRect() : canvas.getBoundingClientRect();
        const width = Math.max(260, Math.floor(rect.width || 420));
        const height = Math.max(320, Math.floor(rect.height || 620));
        const dpr = Math.max(1, window.devicePixelRatio || 1);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, width, height };
    }

    function getMeatPileStage(total) {
        if (total < 3000) return { width: 0.68, height: 0.20 };
        if (total < 6000) return { width: 0.78, height: 0.30 };
        if (total < 9000) return { width: 0.86, height: 0.40 };
        if (total < 12000) return { width: 0.93, height: 0.50 };
        if (total < 15000) return { width: 0.98, height: 0.60 };
        return { width: 1.00, height: 0.70 };
    }

    function buildMeatPilePositions(totalCount, width, height) {
        if (totalCount <= 0) return [];

        const stage = getMeatPileStage(state.meatTotal);
        const pileWidth = Math.max(MEAT_PILE_FONT_SIZE * 2, width * stage.width);
        const pileHeight = Math.max(MEAT_PILE_FONT_SIZE, height * stage.height);
        const centerX = width / 2;
        const halfWidth = pileWidth / 2;
        const bottomY = height - MEAT_PILE_FONT_SIZE * 0.42;
        const positions = [];

        for (let index = 0; index < totalCount; index++) {
            const xRoll = meatHash(index * 11 + 17);
            const yRoll = meatHash(index * 17 + 29);

            const x = centerX - halfWidth + MEAT_PILE_FONT_SIZE / 2
                + xRoll * Math.max(1, pileWidth - MEAT_PILE_FONT_SIZE);

            const distanceFromCenter = Math.min(1, Math.abs(x - centerX) / Math.max(1, halfWidth));
            const localHeight = pileHeight * (0.28 + 0.72 * (1 - Math.pow(distanceFromCenter, 1.45)));
            const rise = Math.pow(yRoll, 1.55) * localHeight;
            const y = bottomY - rise;

            positions.push({
                x: Math.max(MEAT_PILE_FONT_SIZE / 2, Math.min(width - MEAT_PILE_FONT_SIZE / 2, x)),
                y: Math.max(MEAT_PILE_FONT_SIZE / 2, Math.min(bottomY, y))
            });
        }

        return positions.sort((a, b) => a.y - b.y);
    }

    function getCurrentFindPosition(positions) {
        const item = getCurrentFindDefinition();
        if (!item || positions.length === 0) return null;

        const itemIndex = MEAT_FIND_ITEMS.findIndex(candidate => candidate.key === item.key);
        const ratios = [0.72, 0.43, 0.81, 0.58, 0.66, 0.35];
        const ratio = ratios[itemIndex] ?? 0.5;
        const index = Math.max(0, Math.min(positions.length - 1, Math.floor((positions.length - 1) * ratio)));

        return { item, index, ...positions[index] };
    }

    function drawMeatPileBase(ctx, count, positions, width, height) {
        ctx.clearRect(0, 0, width, height);
        ctx.font = `${MEAT_PILE_FONT_SIZE}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const find = getCurrentFindPosition(positions);
        meatFindHitbox = null;

        for (let i = 0; i < count; i++) {
            if (find && i === find.index) continue;
            const pos = positions[i];
            if (pos) ctx.fillText('🍖', pos.x, pos.y);
        }

        if (find && find.index < count) {
            ctx.font = `${Math.round(MEAT_PILE_FONT_SIZE * 1.12)}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
            ctx.fillText(find.item.emoji, find.x, find.y);
            meatFindHitbox = {
                x: find.x,
                y: find.y,
                radius: MEAT_PILE_FONT_SIZE * 0.72
            };
        }
    }

    function renderMeatPile(newPieceCount = 0) {
        const canvas = document.getElementById('meat-pile-canvas');
        if (!canvas) return;

        if (meatPileAnimationFrame) {
            cancelAnimationFrame(meatPileAnimationFrame);
            meatPileAnimationFrame = null;
        }

        const totalCount = getMeatPieceCount();
        const { ctx, width, height } = setupMeatPileCanvas(canvas);
        const positions = buildMeatPilePositions(totalCount, width, height);

        if (totalCount <= 0) {
            ctx.clearRect(0, 0, width, height);
            meatFindHitbox = null;
            return;
        }

        const animateCount = Math.max(0, Math.min(newPieceCount, MEAT_PILE_ANIMATION_MAX, totalCount));

        if (animateCount === 0) {
            drawMeatPileBase(ctx, totalCount, positions, width, height);
            return;
        }

        const staticCount = totalCount - animateCount;
        const startTime = performance.now();

        const animate = now => {
            drawMeatPileBase(ctx, staticCount, positions, width, height);

            ctx.font = `${MEAT_PILE_FONT_SIZE}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let finished = true;

            for (let j = 0; j < animateCount; j++) {
                const index = staticCount + j;
                const target = positions[index];
                if (!target) continue;

                const delay = (j % 20) * 18;
                const duration = 550 + meatHash(index + 101) * 450;
                const raw = (now - startTime - delay) / duration;
                const progress = Math.max(0, Math.min(1, raw));

                if (progress < 1) finished = false;
                if (raw < 0) continue;

                const eased = 1 - Math.pow(1 - progress, 3);
                const startX = target.x + (meatHash(index + 211) - 0.5) * 80;
                const startY = -28 - meatHash(index + 307) * 90;
                const x = startX + (target.x - startX) * eased;
                const y = startY + (target.y - startY) * eased;

                ctx.fillText('🍖', x, y);
            }

            if (finished) {
                drawMeatPileBase(ctx, totalCount, positions, width, height);
                meatPileAnimationFrame = null;
            } else {
                meatPileAnimationFrame = requestAnimationFrame(animate);
            }
        };

        meatPileAnimationFrame = requestAnimationFrame(animate);
    }

    function handleMeatPileClick(event) {
        if (!meatFindHitbox) return;
        if (event.target instanceof Element && event.target.closest('button, input')) return;

        const canvas = document.getElementById('meat-pile-canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const dx = x - meatFindHitbox.x;
        const dy = y - meatFindHitbox.y;

        if (Math.sqrt(dx * dx + dy * dy) <= meatFindHitbox.radius) {
            collectCurrentMeatFind();
        }
    }

    function playMeatCompleteCelebration() {
        const existing = document.querySelector('.meat-complete-overlay');
        if (existing) existing.remove();

        const gc = document.getElementById('game-container');
        if (gc) {
            gc.classList.remove('meat-complete-burst');
            void gc.offsetWidth;
            gc.classList.add('meat-complete-burst');
        }

        const stampCells = Array.from(document.querySelectorAll('.meat-stamp-cell'));
        stampCells.forEach((cell, index) => {
            cell.classList.remove('meat-complete-pulse');
            cell.style.animationDelay = `${index * 85}ms`;
            void cell.offsetWidth;
            cell.classList.add('meat-complete-pulse');
        });

        const overlay = document.createElement('div');
        overlay.className = 'meat-complete-overlay';

        const title = document.createElement('div');
        title.className = 'meat-complete-title';
        title.innerHTML = `
            <span class="big">コンプリート！</span>
        `;
        overlay.appendChild(title);

        const dropCount = 54;
        for (let i = 0; i < dropCount; i++) {
            const drop = document.createElement('span');
            drop.className = 'meat-complete-drop';
            drop.textContent = '🍖';

            const left = 2 + ((i * 37) % 96);
            const delay = ((i * 7) % 22) * 0.055;
            const duration = 1.55 + ((i * 11) % 9) * 0.11;
            const size = 34 + ((i * 13) % 24);

            drop.style.left = `${left}%`;
            drop.style.animationDelay = `${delay}s`;
            drop.style.animationDuration = `${duration}s`;
            drop.style.fontSize = `${size}px`;
            overlay.appendChild(drop);
        }

        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.remove();
            stampCells.forEach(cell => {
                cell.classList.remove('meat-complete-pulse');
                cell.style.animationDelay = '';
            });
            if (gc) gc.classList.remove('meat-complete-burst');
        }, 3900);
    }

    function showMeatRewardPreview(amount) {
        const reward = MEAT_STAMP_REWARDS.find(candidate => candidate.amount === amount);
        if (!reward) return;

        hideMeatRewardPreview();

        const key = `stamp_${reward.amount}`;
        const received = !!state.meatRewardReceived[key];
        const pending = !!state.meatPendingRewards[key] && !received;
        const definition = getRewardItemDefinitionState(reward);

        let status = '未達成';
        if (received) {
            status = '獲得済み';
        } else if (pending) {
            status = definition.item && definition.valid
                ? '次の通常報告で解放'
                : '報酬定義を確認してください';
        } else if (state.meatTotal >= reward.amount) {
            status = '達成済み';
        }

        const overlay = document.createElement('div');
        overlay.className = 'meat-reward-preview-overlay';
        overlay.id = 'meat-reward-preview-overlay';
        overlay.onclick = event => {
            if (event.target === overlay) hideMeatRewardPreview();
        };

        const imagePath = typeof getItemImagePath === 'function'
            ? getItemImagePath(reward.file)
            : reward.file;

        overlay.innerHTML = `
            <div class="meat-reward-preview-card" role="dialog" aria-modal="true" aria-label="${escapeHtml(reward.name)}の報酬詳細">
                <div class="meat-reward-preview-title">${reward.amount.toLocaleString()}個達成報酬</div>
                <img
                    class="meat-reward-preview-image"
                    src="${escapeHtml(imagePath)}"
                    alt="${escapeHtml(reward.name)}"
                    onerror="this.style.opacity='.25';"
                >
                <div class="meat-reward-preview-name">${escapeHtml(reward.name)}</div>
                <div class="meat-reward-preview-meta">${escapeHtml(getRewardTypeLabel(reward.type))}</div>
                <div class="meat-reward-preview-status">${escapeHtml(status)}</div>
                <button type="button" class="meat-reward-preview-close" onclick="hideMeatRewardPreview()">閉じる</button>
            </div>
        `;

        document.body.appendChild(overlay);
    }

    function hideMeatRewardPreview() {
        const overlay = document.getElementById('meat-reward-preview-overlay');
        if (overlay) overlay.remove();
    }

    function renderStampRally() {
        const stampCount = getStampCount();
        const nextStampNumber = stampCount < 15 ? stampCount + 1 : null;
        const cells = [];

        for (let i = 1; i <= 15; i++) {
            const amount = i * MEAT_STAMP_STEP;
            const completed = i <= stampCount;
            const isNext = i === nextStampNumber;
            const reward = MEAT_STAMP_REWARDS.find(r => r.amount === amount);
            const rewardPoint = !!reward;
            const key = reward ? `stamp_${reward.amount}` : null;
            const rewardReceived = key ? !!state.meatRewardReceived[key] : false;
            const rewardPending = key ? !!state.meatPendingRewards[key] && !rewardReceived : false;

            let cls = completed ? 'done' : isNext ? 'next' : 'locked';
            if (rewardPending) cls = 'pending';

            const fallback = completed ? '✓' : isNext ? '🥩' : '○';

            cells.push(`
                <div class="meat-stamp-cell ${cls}${rewardPoint ? ' reward-point' : ''}" title="${amount.toLocaleString()}個${reward ? `：${escapeHtml(reward.name)}` : ''}">
                    ${isNext && !rewardPending ? '<span class="meat-stamp-next-tag">NEXT</span>' : ''}
                    ${reward ? `<button class="meat-stamp-gift-button" type="button" aria-label="${escapeHtml(reward.name)}の報酬を確認" title="報酬を見る" onclick="event.stopPropagation(); showMeatRewardPreview(${reward.amount})">🎁</button>` : ''}
                    <img
                        class="meat-stamp-image"
                        src="${typeof getItemImagePath === 'function' ? getItemImagePath(MEAT_STAMP_IMAGE) : MEAT_STAMP_IMAGE}"
                        alt="スタンプ"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                    >
                    <span class="meat-stamp-fallback">${fallback}</span>
                    <span style="font-size:10px;">${amount.toLocaleString()}</span>
                    ${rewardPending ? '<span style="font-size:8px; color:#9a5b0a;">次回解放</span>' : ''}
                </div>
            `);
        }
        return cells.join('');
    }

    function renderNextRewardCard() {
        const pendingRewards = getPendingRewards();

        if (pendingRewards.length > 0) {
            const reward = pendingRewards[0];
            const more = pendingRewards.length > 1 ? `ほか ${pendingRewards.length - 1}件` : '';

            return `
                <div class="meat-rally-card meat-pending-notice">
                    <div style="font-size:10px; font-weight:bold; color:#b56b0b; letter-spacing:.08em; margin-bottom:4px;">報酬解放待ち</div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${renderRewardIcon(reward)}
                        <div style="min-width:0; flex:1;">
                            <div style="font-size:12px; color:#7a4a0b;">${reward.amount.toLocaleString()}個達成・${getRewardTypeLabel(reward.type)}</div>
                            <div style="font-size:15px; font-weight:bold; color:#7a4a0b; margin-top:1px;">${escapeHtml(reward.name)}</div>
                            <div style="font-size:12px; font-weight:bold; color:#b56b0b; margin-top:4px;">次の報告で解放できます。${more}</div>
                        </div>
                    </div>
                </div>`;
        }

        const nextReward = getNextReward();

        if (!nextReward) {
            return `
                <div class="meat-rally-card meat-next-reward" style="text-align:center;">
                    <div style="font-size:22px; margin-bottom:3px;">🎉</div>
                    <div style="font-size:15px; font-weight:bold; color:#8e2d41;">15,000個コンプリート！</div>
                    <div style="font-size:12px; color:#64748b; margin-top:3px;">5つの報酬をすべて獲得したぞ。</div>
                </div>`;
        }

        const remaining = Math.max(0, nextReward.amount - state.meatTotal);

        return `
            <div class="meat-rally-card meat-next-reward">
                <div style="font-size:10px; font-weight:bold; color:#c0392b; letter-spacing:.08em; margin-bottom:4px;">次の報酬</div>
                <div style="display:flex; align-items:center; gap:10px;">
                    ${renderRewardIcon(nextReward)}
                    <div style="min-width:0; flex:1;">
                        <div style="font-size:12px; color:#64748b;">${nextReward.amount.toLocaleString()}個達成・${getRewardTypeLabel(nextReward.type)}</div>
                        <div style="font-size:15px; font-weight:bold; color:#7f1d2d; margin-top:1px;">${escapeHtml(nextReward.name)}</div>
                    </div>
                    <div style="text-align:right; flex-shrink:0;">
                        <div style="font-size:10px; color:#64748b;">あと</div>
                        <div style="font-size:17px; font-weight:bold; color:#c0392b;">${remaining.toLocaleString()}個</div>
                    </div>
                </div>
            </div>`;
    }

    function renderRewardList() {
        const nextReward = getNextReward();

        return MEAT_STAMP_REWARDS.map(reward => {
            const key = `stamp_${reward.amount}`;
            const received = !!state.meatRewardReceived[key];
            const pending = !!state.meatPendingRewards[key] && !received;
            const isNext = !!nextReward && nextReward.amount === reward.amount;
            const definition = getRewardItemDefinitionState(reward);

            let cls = 'locked';
            let status = '🔒 未達成';
            let statusColor = '#64748b';

            if (received) {
                cls = 'done';
                status = '✓ 獲得済み';
                statusColor = '#26723b';
            } else if (pending) {
                cls = 'pending';
                if (!definition.item) {
                    status = '⏳ 定義追加後、次の報告で解放';
                } else if (!definition.valid) {
                    status = '⚠ 定義を確認';
                } else {
                    status = '⏳ 次の報告で解放できます';
                }
                statusColor = '#b56b0b';
            } else if (isNext) {
                cls = 'next';
                const remaining = Math.max(0, reward.amount - state.meatTotal);
                status = `NEXT・あと ${remaining.toLocaleString()}個`;
                statusColor = '#c0392b';
            }

            return `
                <div class="meat-reward-item ${cls}">
                    ${renderRewardIcon(reward)}
                    <div style="min-width:0;">
                        <div style="font-size:10px; color:#64748b;">${reward.amount.toLocaleString()}個・${getRewardTypeLabel(reward.type)}</div>
                        <div style="font-size:13px; font-weight:bold; color:${received ? '#215e33' : pending ? '#7a4a0b' : isNext ? '#8e2d41' : '#334155'}; margin-top:2px;">${escapeHtml(reward.name)}</div>
                    </div>
                    <div class="meat-reward-status" style="color:${statusColor};">${status}</div>
                </div>`;
        }).join('');
    }

    function renderMeatRewardOrPileCard() {
        if (meatPanelView === 'pile') {
            return `
                <div class="meat-rally-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:9px;">
                        <div style="font-size:13px; font-weight:bold; color:#8e2d41;">🍖 肉の山</div>
                        <button class="meat-view-switch" onclick="setMeatPanelView('rewards')">🎁 報酬を見る</button>
                    </div>
                    <div class="meat-pile-view">
                        <canvas id="meat-pile-canvas" class="meat-pile-canvas"></canvas>
                    </div>
                </div>`;
        }

        return `
            <div class="meat-rally-card">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:9px;">
                    <div style="font-size:13px; font-weight:bold; color:#8e2d41;">報酬</div>
                    <button class="meat-view-switch" onclick="setMeatPanelView('pile')">🍖 肉の山を見る</button>
                </div>
                <div class="meat-reward-grid">${renderRewardList()}</div>
            </div>`;
    }

    function setMeatPanelView(view) {
        meatPanelView = view === 'pile' ? 'pile' : 'rewards';
        renderMeatPanel();
    }

    function renderMeatPanel(result = null, newPilePieces = 0) {
        ensureMeatState();
        const panel = document.getElementById('meat-mode-panel');
        if (!panel) return;

        const stampCount = getStampCount();

        panel.innerHTML = `
            <div class="meat-mode-root" style="width:100%;">
                <div class="meat-mode-foreground">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                    <h3 style="margin:0; color:#8e2d41; flex:1; min-width:130px;">🥩 肉集めモード</h3>
                    <button onclick="showMeatHelp()" style="padding:8px 12px; background-color:#b97888;">？ ヘルプ</button>
                    <button onclick="closeMeatMode()" style="padding:8px 12px; background-color:#64748b;">← 貢献度モードに戻る</button>
                </div>

                <div class="status-container">
                    <div class="status-card">
                        <span class="label">🥩 現在の肉の個数</span>
                        <span class="val">${state.meatTotal.toLocaleString()}個</span>
                    </div>
                    <div class="status-card">
                        <span class="label">📣 肉集め報告回数</span>
                        <span class="val">${state.meatReportCount}回</span>
                    </div>
                    <div class="status-card">
                        <span class="label">🎫 スタンプ</span>
                        <span class="val">${stampCount} / 15</span>
                    </div>
                </div>

                <div class="input-group">
                    <input type="number" id="input-meat" placeholder="現在の肉の個数を入力" onkeydown="if(['e', 'E', '+', '-', '.'].includes(event.key)) event.preventDefault();">
                    <div style="display:grid; grid-auto-rows:1fr; gap:10px; flex-shrink:0; min-width:150px;">
                        <button id="btn-meat-report" onclick="reportMeat()" style="width:100%; height:100%; background-color:#c0392b;">肉集めの報告をする</button>
                        <button id="btn-meat-fix" onclick="fixMeat()" style="width:100%; height:100%; background-color:#f39c12;">
                            肉の数を修正<br><span style="font-size:10px;">（報酬は増加しません。）</span>
                        </button>
                    </div>
                </div>

                <div id="meat-cooldown-text" style="color:#c0392b; font-size:13px; font-weight:bold; min-height:20px; display:flex; align-items:center;"></div>


                <div class="meat-rally-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
                        <strong style="font-size:13px; color:#8e2d41;">スタンプラリー</strong>
                        </span>
                    </div>
                    <div class="meat-stamp-grid">${renderStampRally()}</div>
                </div>

                ${renderMeatFindCollection()}

                ${renderMeatRewardOrPileCard()}
                </div>
            </div>`;

        updateMeatThemeColor();
        updateMeatCooldownUI();

        const root = panel.querySelector('.meat-mode-root');
        if (root) root.addEventListener('click', handleMeatPileClick);

        if (meatPanelView === 'pile') {
            requestAnimationFrame(() => renderMeatPile(newPilePieces));
        } else {
            meatFindHitbox = null;
        }
    }

    function showMeatHelp() {
        const modal = document.getElementById('info-modal');
        const content = document.getElementById('info-content');

        if (!modal || !content) return;

        if (typeof window._meatHelpInfoBackup !== 'string') {
            window._meatHelpInfoBackup = content.innerHTML;
        }

        content.innerHTML = `
            <h2>肉集めモード</h2>
            <p>
                現在集めている肉の個数を報告するモードです。報告は15分に1回できます。
            </p>

            <h2>スタンプラリー</h2>
            <p>
                1,000個ごとにスタンプを1個獲得します。<br>
                スタンプが貯まると着せ替え報酬があります。到達した報酬は次の通常報告で解放されます。
            </p>

            <h2>肉の数を修正</h2>
            <p>
                入力を間違えた場合は「肉の数を修正」を使ってください。
            </p>

            <h2>肉の山</h2>
            <p>
                肉100個につき「肉の山」に🍖が1個積み上がります。報酬欄の「肉の山を見る」から確認できます。<br>
                肉の山には変なものが紛れ込んでることも……？
            </p>

            <button onclick="hideMeatHelp()" class="close-btn">閉じる</button>
        `;
        modal.style.display = 'flex';
    }

    function hideMeatHelp() {
        const modal = document.getElementById('info-modal');
        const content = document.getElementById('info-content');

        if (modal) modal.style.display = 'none';

        if (content && typeof window._meatHelpInfoBackup === 'string') {
            content.innerHTML = window._meatHelpInfoBackup;
            delete window._meatHelpInfoBackup;
        }
    }

    function openMeatMode() {
        ensureMeatState();
        const sectionTop = document.getElementById('section-top');
        if (!sectionTop) return;

        const status = sectionTop.querySelector('.status-container');
        const contributionInput = sectionTop.querySelector(':scope > .input-group');
        const cooldown = document.getElementById('cooldown-text');
        const panel = document.getElementById('meat-mode-panel');

        if (status) status.style.display = 'none';
        if (contributionInput) contributionInput.style.display = 'none';
        if (cooldown) cooldown.style.display = 'none';
        if (panel) panel.style.display = 'flex';

        applyMeatTheme(true);
        renderMeatPanel();
        startMeatCooldownTimer();
        setMeatLancelotMessage('団長、お疲れ様。集めた肉の個数を報告してくれ！', 'lancelot_1.png');
    }

    function closeMeatMode() {
        const sectionTop = document.getElementById('section-top');
        if (!sectionTop) return;

        const status = sectionTop.querySelector('.status-container');
        const contributionInput = sectionTop.querySelector(':scope > .input-group');
        const cooldown = document.getElementById('cooldown-text');
        const panel = document.getElementById('meat-mode-panel');

        if (status) status.style.display = '';
        if (contributionInput) contributionInput.style.display = '';
        if (cooldown) cooldown.style.display = '';
        if (panel) panel.style.display = 'none';

        applyMeatTheme(false);
        stopMeatCooldownTimer();
        updateCooldownUI();
        setMeatLancelotMessage('貢献度の報告に戻るんだな。応援しているぞ、団長。', 'lancelot_1.png');
    }

    function commitMeatReport(inputVal) {
        ensureMeatState();

        const confirmedResult = confirmPendingRewards(inputVal, true);
        const previousTotal = state.meatTotal;
        const previousPieceCount = getMeatPieceCount();

        state.meatTotal = inputVal;
        state.highestMeatTotal = Math.max(state.highestMeatTotal, inputVal);
        state.meatReportCount++;
        state.meatLastReportTime = Date.now();

        const queuedResult = queueReachedRewards(true);
        maybeSpawnMeatFind();

        const shouldCelebrateComplete =
            previousTotal < MEAT_MAX_TOTAL &&
            state.meatTotal >= MEAT_MAX_TOTAL &&
            !state.meatCompleteCelebrated;

        if (shouldCelebrateComplete) {
            state.meatCompleteCelebrated = true;
        }

        const currentPieceCount = getMeatPieceCount();
        const newPilePieces = Math.max(0, currentPieceCount - previousPieceCount);

        const resultLines = [
            ...confirmedResult.lines,
            ...queuedResult.lines
        ];

        if (previousTotal < MEAT_MAX_TOTAL && state.meatTotal >= MEAT_MAX_TOTAL) {
            resultLines.push('15,000個達成！ 肉集めスタンプラリーコンプリート！');
        }

        if (confirmedResult.unlockedSomething) {
            renderItems();
        }

        const input = document.getElementById('input-meat');
        if (input) input.value = '';

        const reaction = getReportLineForTotal(state.meatTotal);
        state.lastMeatReaction = {
            img: reaction.img,
            msg: reaction.msg
        };

        updateUI();
        saveGame();
        renderMeatPanel(resultLines.length > 0 ? { lines: resultLines } : null, newPilePieces);

        if (shouldCelebrateComplete) {
            requestAnimationFrame(() => playMeatCompleteCelebration());
        }

        startMeatCooldownTimer();
        setMeatLancelotMessage(reaction.msg, reaction.img);
    }

    function reportMeat() {
        ensureMeatState();
        const input = document.getElementById('input-meat');
        if (!input) return;

        const inputValStr = input.value.trim();
        if (inputValStr === '' || !/^\d+$/.test(inputValStr)) {
            setMeatLancelotMessage('団長、その報告はうまく読めないぞ。数字だけで入力してくれ。', 'lancelot_2.png');
            return;
        }

        const inputVal = Number(inputValStr);
        if (!Number.isSafeInteger(inputVal) || inputVal < 0) {
            setMeatLancelotMessage('団長、その報告はうまく読めないぞ。正しい肉の個数を入力してくれ。', 'lancelot_1.png');
            return;
        }

        if (inputVal >= MEAT_RECORD_LIMIT) {
            setMeatLancelotMessage('そんな数はあり得ないはずだぞ。', 'lancelot_2.png');
            return;
        }

        const cooldownRemaining = getMeatCooldownRemaining();
        if (cooldownRemaining > 0) {
            const remainMin = Math.ceil(cooldownRemaining / 1000 / 60);
            setMeatLancelotMessage(`少し休憩したらどうだ？ 次の報告時間まであと ${remainMin} 分だ。`, 'lancelot_1.png');
            updateMeatCooldownUI();
            return;
        }

        if (inputVal < state.meatTotal) {
            setMeatLancelotMessage('団長、肉が減っているようだ。減らしたい場合は「肉の数を修正」を使ってくれ。', 'lancelot_5.png');
            return;
        }

        if (inputVal === state.meatTotal && !hasPendingRewards()) {
            setMeatLancelotMessage('前回と同じ数だな。新しく集めたらまた教えてくれ。', 'lancelot_1.png');
            return;
        }

        const diff = inputVal - state.meatTotal;

        if (diff >= 3000) {
            showCustomConfirm(
                `前回から ${diff.toLocaleString()}個 増えているぞ。\n現在の肉の数は ${inputVal.toLocaleString()}個 で間違いないか？\n\n※到達した報酬は今回すぐには配布されず、次の報告で解放できます。`,
                () => commitMeatReport(inputVal)
            );
            return;
        }

        commitMeatReport(inputVal);
    }

    function fixMeat() {
        ensureMeatState();
        const input = document.getElementById('input-meat');
        if (!input) return;

        const inputValStr = input.value.trim();
        if (inputValStr === '' || !/^\d+$/.test(inputValStr)) {
            setMeatLancelotMessage('そんな肉の量はあり得ないと思うが……修正する数字を確認してくれ。', 'lancelot_2.png');
            return;
        }

        const inputVal = Number(inputValStr);
        if (!Number.isSafeInteger(inputVal) || inputVal < 0) {
            setMeatLancelotMessage('修正する肉の個数を確認してくれ。', 'lancelot_2.png');
            return;
        }

        if (inputVal >= MEAT_RECORD_LIMIT) {
            setMeatLancelotMessage('そんな数はあり得ないはずだぞ。', 'lancelot_2.png');
            return;
        }

        const oldTotal = state.meatTotal;
        state.meatTotal = inputVal;
        state.highestMeatTotal = Math.max(state.highestMeatTotal, inputVal);

        const canceled = cancelInvalidPendingRewards();

        input.value = '';
        saveGame();
        renderMeatPanel();

        let message = `肉の数を ${oldTotal.toLocaleString()}個から ${inputVal.toLocaleString()}個に修正したぞ。`;
        if (canceled) {
            message += ' 条件を下回った報酬は取り消しておいた。';
        }
        setMeatLancelotMessage(message, inputVal < oldTotal ? 'lancelot_5.png' : 'lancelot_1.png');
    }

    function initMeatMode() {
        const sanitized = ensureMeatState();
        ensureMeatThemeStyle();

        const rewardStateChanged = syncExistingRewardState();
        if (sanitized || rewardStateChanged) {
            saveGame();
        }

        renderMeatPanel();

        const mainTabs = document.querySelectorAll('#main-nav .tab-item');
        mainTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                if (index === 0 && isMeatPanelOpen()) {
                    applyMeatTheme(true);
                } else if (index !== 0) {
                    applyMeatTheme(false);
                }
            });
        });
    }

    window.initMeatMode = initMeatMode;
    window.openMeatMode = openMeatMode;
    window.showMeatHelp = showMeatHelp;
    window.hideMeatHelp = hideMeatHelp;
    window.showMeatRewardPreview = showMeatRewardPreview;
    window.hideMeatRewardPreview = hideMeatRewardPreview;
    window.replayMeatFind = replayMeatFind;
    window.setMeatPanelView = setMeatPanelView;
    window.closeMeatMode = closeMeatMode;
    window.reportMeat = reportMeat;
    window.fixMeat = fixMeat;
})();