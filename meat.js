
(() => {
    const MEAT_MAX_TOTAL = 15000;
    const MEAT_STAMP_STEP = 1000;
    const MEAT_COOLDOWN_MS = 15 * 60 * 1000;
    const MEAT_STAMP_IMAGE = 'meat_stamp.png';
    const MEAT_PILE_ANIMATION_MAX = 80;
    let meatTimerInterval = null;
    let meatPileAnimationFrame = null;

    const MEAT_STAMP_REWARDS = [
        { amount: 3000,  itemId: 'meat3000',  name: '勲章',           file: 'meat_3000.png',  type: 'acc' },
        { amount: 6000,  itemId: 'meat6000',  name: 'マウスカーソル', file: 'meat_6000.png',  type: 'acc' },
        { amount: 9000,  itemId: 'meat9000',  name: '山盛りの肉',     file: 'meat_9000.png',  type: 'acc' },
        { amount: 12000, itemId: 'meat12000', name: '肉集め名人',     file: 'meat_12000.png', type: 'setup' },
        { amount: 15000, itemId: 'meat15000', name: '認証画面',       file: 'meat_15000.png', type: 'bg' }
    ];

    const MEAT_REPORT_LINES = [
        { img: 'lancelot_1.png', msg: '肉集めお疲れさま、団長。着実に増えているな。' },
        { img: 'lancelot_1.png', msg: '報告ありがとう。次も無理のない範囲で頑張ろう。' },
        { img: 'lancelot_5.png', msg: 'それにしても、これだけの肉をどこに置いているんだ……？' },
        { img: 'lancelot_6.png', msg: 'ヴェインなら美味しく調理してくれそうだと思わないか？頼んでみるか……' },
        { img: 'lancelot_1.png', msg: '少しずつスタンプが埋まってきたな。本戦への準備もばっちりだろうか？' },
        { img: 'lancelot_3.png', msg: 'パーシヴァルに頼んだら全部焼いてくれるかな。ふふっ、バーベキューみたいだ。' },
        { img: 'lancelot_5.png', msg: '肉の数を数えるのもなかなか大変そうだな。そもそも誰が捌いているんだ……？' },
        { img: 'lancelot_1.png', msg: '団長は肉集めが好きなのか？……いや、仕事だからやっているんだよな。' },
        { img: 'lancelot_3.png', msg: 'これだけ集めれば、戦いの準備もかなり進んだんじゃないか？本戦が楽しみだな！' },
        { img: 'lancelot_6.png', msg: 'ジークフリートさん、そんな大きなお肉をひと口で！俺も見習います！' },
        { img: 'lancelot_8.png', msg: '肉、肉、肉……見ているだけで少し腹が減ってきたな。' },
        { img: 'lancelot_1.png', msg: '俺は甘いものが大好きだが、肉も大好物だ。もっとも、魔物の肉はそんなに食べないが……' },
        { img: 'lancelot_4.png', msg: 'かなり集めたな……。無理をしていないか？今回はどれだけ走るつもりなんだ？' },
        { img: 'lancelot_6.png', msg: 'さすがだな、団長！この調子なら最後のスタンプまで届きそうだな！' },
        { img: 'lancelot_1.png', msg: '肉は多くても少なくても悲しくなるよな。計画が大変だ。いつもお疲れ様！' },
        { img: 'lancelot_5.png', msg: '食べきれなかった肉はどこへ行っているのだろうか。冷凍して保存しておきたいものだが……' },
        { img: 'lancelot_8.png', msg: '同じ動作をしていると眠くなってくるよな……俺もまだ鍛錬が足りないのか……？' },
        { img: 'lancelot_1.png', msg: '団長とこうして進捗を確認するのも、古戦場の楽しみのひとつかもしれないな。' },
        { img: 'lancelot_3.png', msg: '団長、休憩の予定はないか？お茶をするなら、ぜひ俺も呼んでくれると嬉しいぞ！' },
        { img: 'lancelot_1.png', msg: '本戦の準備はばっちりだな、団長。日頃の鍛錬の成果を見せる時だ。' }
    ];

    function ensureMeatState() {
        if (!Number.isSafeInteger(state.meatTotal) || state.meatTotal < 0) state.meatTotal = 0;
        if (!Number.isSafeInteger(state.highestMeatTotal) || state.highestMeatTotal < 0) state.highestMeatTotal = state.meatTotal;
        if (!Number.isSafeInteger(state.meatReportCount) || state.meatReportCount < 0) state.meatReportCount = 0;
        if (!state.meatRewardReceived || typeof state.meatRewardReceived !== 'object' || Array.isArray(state.meatRewardReceived)) state.meatRewardReceived = {};
        if (!state.meatPendingRewards || typeof state.meatPendingRewards !== 'object' || Array.isArray(state.meatPendingRewards)) state.meatPendingRewards = {};
        if (!Number.isSafeInteger(state.meatLastReportTime) || state.meatLastReportTime < 0) state.meatLastReportTime = 0;

        if (!state.meatCollection || typeof state.meatCollection !== 'object' || Array.isArray(state.meatCollection)) state.meatCollection = {};
        if (!Number.isSafeInteger(state.meatGiftCount) || state.meatGiftCount < 0) state.meatGiftCount = 0;
        if (!Number.isSafeInteger(state.meatBoxProgress) || state.meatBoxProgress < 0) state.meatBoxProgress = 0;
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
            body.meat-mode-page { background-color: #ffe4eb !important; }
            #game-container.mode-top.meat-mode-active { background-color: #ffe4eb !important; }
            #game-container.mode-top.meat-mode-active #content-wrapper,
            #game-container.mode-top.meat-mode-active #ui-area,
            #game-container.mode-top.meat-mode-active #section-top { background-color: #ffe4eb !important; }

            .meat-rally-card {
                background: rgba(255,255,255,0.88);
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
            .meat-stamp-cell.reward-point::after {
                content: '🎁';
                position: absolute;
                top: -7px;
                right: -5px;
                font-size: 14px;
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
                background: #f8fafc;
                box-sizing: border-box;
            }
            .meat-reward-item.done { border-color: #86c694; background: #effaf1; }
            .meat-reward-item.next { border: 2px solid #c0392b; background: #fff1f3; box-shadow: 0 2px 8px rgba(192,57,43,.10); }
            .meat-reward-item.pending { border: 2px solid #e68a19; background: #fff8eb; box-shadow: 0 2px 8px rgba(230,138,25,.10); }
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

            .meat-pile-stage {
                position: relative;
                height: 180px;
                overflow: hidden;
                border-radius: 10px;
                border: 1px solid #efb7c3;
                background: linear-gradient(to bottom, rgba(255,255,255,.96), rgba(255,239,242,.94));
            }
            .meat-pile-canvas {
                display: block;
                width: 100%;
                height: 180px;
            }
            .meat-pile-label {
                position: absolute;
                top: 8px;
                left: 9px;
                z-index: 2;
                padding: 3px 7px;
                border-radius: 999px;
                background: rgba(255,255,255,.88);
                color: #8e2d41;
                font-size: 10px;
                font-weight: bold;
                pointer-events: none;
            }

            @media (max-width: 768px) {
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

    function getRandomReportLine() {
        return MEAT_REPORT_LINES[Math.floor(Math.random() * MEAT_REPORT_LINES.length)];
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
                    src="${escapeHtml(reward.file)}"
                    alt="${escapeHtml(reward.name)}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"
                >
                <span class="meat-reward-icon-fallback" style="display:none;">🎁</span>
            </div>
        `;
    }

    function getMeatPieceCount() {
        return Math.floor(state.meatTotal / 10);
    }

    function meatHash(seed) {
        const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return x - Math.floor(x);
    }

    function setupMeatPileCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(260, Math.floor(rect.width || (canvas.parentElement ? canvas.parentElement.clientWidth : 420) || 420));
        const height = 180;
        const dpr = Math.max(1, window.devicePixelRatio || 1);

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, width, height };
    }

    function getMeatPiecePosition(index, totalCount, width, height) {
        const columns = Math.max(18, Math.floor(width / 12));
        const rows = Math.max(1, Math.ceil(totalCount / columns));
        const rowStep = Math.max(2.4, Math.min(7, (height - 24) / rows));
        const colWidth = width / columns;
        const row = Math.floor(index / columns);
        const col = index % columns;

        const jitterX = (meatHash(index * 3 + 1) - 0.5) * colWidth * 0.8;
        const jitterY = (meatHash(index * 7 + 2) - 0.5) * 3;

        return {
            x: Math.max(7, Math.min(width - 7, (col + 0.5) * colWidth + jitterX)),
            y: Math.max(16, height - 8 - row * rowStep + jitterY)
        };
    }

    function drawMeatPileBase(ctx, count, totalCount, width, height) {
        ctx.clearRect(0, 0, width, height);
        ctx.font = '14px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < count; i++) {
            const pos = getMeatPiecePosition(i, totalCount, width, height);
            ctx.fillText('🍖', pos.x, pos.y);
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

        if (totalCount <= 0) {
            ctx.clearRect(0, 0, width, height);
            return;
        }

        const animationLimit = totalCount > 5000 ? 30 : MEAT_PILE_ANIMATION_MAX;
        const animateCount = Math.max(0, Math.min(newPieceCount, animationLimit, totalCount));

        if (animateCount === 0) {
            drawMeatPileBase(ctx, totalCount, totalCount, width, height);
            return;
        }

        const staticCount = totalCount - animateCount;
        const startTime = performance.now();

        const animate = now => {
            drawMeatPileBase(ctx, staticCount, totalCount, width, height);

            ctx.font = '14px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let finished = true;

            for (let j = 0; j < animateCount; j++) {
                const index = staticCount + j;
                const target = getMeatPiecePosition(index, totalCount, width, height);
                const delay = (j % 20) * 18;
                const duration = 550 + meatHash(index + 101) * 450;
                const raw = (now - startTime - delay) / duration;
                const progress = Math.max(0, Math.min(1, raw));

                if (progress < 1) finished = false;
                if (raw < 0) continue;

                const eased = 1 - Math.pow(1 - progress, 3);
                const startX = target.x + (meatHash(index + 211) - 0.5) * 60;
                const startY = -18 - meatHash(index + 307) * 70;
                const x = startX + (target.x - startX) * eased;
                const y = startY + (target.y - startY) * eased;

                ctx.fillText('🍖', x, y);
            }

            if (finished) {
                drawMeatPileBase(ctx, totalCount, totalCount, width, height);
                meatPileAnimationFrame = null;
            } else {
                meatPileAnimationFrame = requestAnimationFrame(animate);
            }
        };

        meatPileAnimationFrame = requestAnimationFrame(animate);
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
                    <img
                        class="meat-stamp-image"
                        src="${MEAT_STAMP_IMAGE}"
                        alt="スタンプ"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                    >
                    <span class="meat-stamp-fallback">${fallback}</span>
                    <span style="font-size:10px;">${amount / 1000}k</span>
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
                    <div style="font-size:11px; line-height:1.6; color:#7a4a0b; margin-top:8px;">
                        肉数を間違えていた場合は、次の報告をする前に「肉数修正」で直してください。
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

    function renderMeatPanel(result = null, newPilePieces = 0) {
        ensureMeatState();
        const panel = document.getElementById('meat-mode-panel');
        if (!panel) return;

        const stampCount = getStampCount();
        const progressTotal = getProgressTotal();
        const progressPercent = Math.min(100, (progressTotal / MEAT_MAX_TOTAL) * 100);
        const nextStamp = stampCount >= 15 ? 0 : ((stampCount + 1) * MEAT_STAMP_STEP - progressTotal);
        const meatPieceCount = getMeatPieceCount();

        let resultHtml = '';
        if (result && result.lines && result.lines.length > 0) {
            resultHtml = `
                <div class="meat-rally-card" style="font-size:13px; line-height:1.7; border-color:#e5a8b5;">
                    ${result.lines.map(line => `<div>${escapeHtml(line)}</div>`).join('')}
                </div>`;
        }

        panel.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:12px; width:100%;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                    <h3 style="margin:0; color:#8e2d41;">🥩 肉集めモード</h3>
                    <button onclick="closeMeatMode()" style="padding:8px 12px; background-color:#64748b;">← 貢献度モードに戻る</button>
                </div>

                <div class="status-container">
                    <div class="status-card">
                        <span class="label">🥩 現在の肉の個数</span>
                        <span class="val">${state.meatTotal.toLocaleString()}個</span>
                    </div>
                    <div class="status-card">
                        <span class="label">📣 肉集め報告</span>
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
                            肉数修正<br><span style="font-size:10px;">（報酬は増加しません。）</span>
                        </button>
                    </div>
                </div>

                <div id="meat-cooldown-text" style="color:#c0392b; font-size:13px; font-weight:bold; min-height:20px; display:flex; align-items:center;"></div>

                <div class="meat-rally-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:10px;">
                        <strong style="font-size:13px; color:#8e2d41;">集めた肉</strong>
                        <span style="font-size:11px; color:#64748b;">${meatPieceCount.toLocaleString()}個の🍖を表示（肉10個＝🍖1個）</span>
                    </div>
                    <div class="meat-pile-stage">
                        <div class="meat-pile-label">🥩 ${state.meatTotal.toLocaleString()}個</div>
                        <canvas id="meat-pile-canvas" class="meat-pile-canvas"></canvas>
                    </div>
                </div>

                <div class="meat-rally-card">
                    <div style="display:flex; justify-content:space-between; align-items:end; gap:10px;">
                        <div>
                            <div style="font-size:13px; font-weight:bold; color:#8e2d41;">肉スタンプラリー</div>
                            <div style="font-size:11px; color:#64748b; margin-top:2px;">${stampCount >= 15 ? '全15スタンプ達成！' : `次のスタンプまであと ${nextStamp.toLocaleString()}個`}</div>
                        </div>
                        <div style="font-size:13px; font-weight:bold; color:#8e2d41; white-space:nowrap;">${progressTotal.toLocaleString()} / ${MEAT_MAX_TOTAL.toLocaleString()}</div>
                    </div>
                    <div class="meat-progress-bar"><div class="meat-progress-fill" style="width:${progressPercent}%;"></div></div>
                    <div style="display:flex; justify-content:space-between; font-size:10px; color:#64748b; margin-top:4px;">
                        <span>0</span><span>15,000</span>
                    </div>
                </div>

                ${renderNextRewardCard()}

                <div class="meat-rally-card">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom:12px;">
                        <strong style="font-size:13px; color:#8e2d41;">15個のスタンプ</strong>
                        <span style="font-size:10px; color:#64748b;">
                            達成済み　<span style="color:#b56b0b; font-weight:bold;">橙枠＝次回解放</span>　
                            <span style="color:#c0392b; font-weight:bold;">赤枠＝次</span>
                        </span>
                    </div>
                    <div class="meat-stamp-grid">${renderStampRally()}</div>
                    <div style="font-size:11px; color:#8e2d41; margin-top:9px;">🎁 3,000個ごとに報酬。到達した次の報告で解放できます。</div>
                </div>

                ${resultHtml}

                <div class="meat-rally-card">
                    <div style="font-size:13px; font-weight:bold; color:#8e2d41; margin-bottom:4px;">報酬</div>
                    <div style="font-size:11px; color:#64748b; line-height:1.6; margin-bottom:9px;">
                        条件に到達した報酬はすぐには配布されません。次の通常報告でも条件を満たしていると解放できます。
                    </div>
                    <div class="meat-reward-grid">${renderRewardList()}</div>
                </div>
            </div>`;

        updateMeatCooldownUI();
        renderMeatPile(newPilePieces);
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

        updateUI();
        saveGame();
        renderMeatPanel(resultLines.length > 0 ? { lines: resultLines } : null, newPilePieces);
        startMeatCooldownTimer();

        const reaction = getRandomReportLine();
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

        const cooldownRemaining = getMeatCooldownRemaining();
        if (cooldownRemaining > 0) {
            const remainMin = Math.ceil(cooldownRemaining / 1000 / 60);
            setMeatLancelotMessage(`少し休憩したらどうだ？ 次の報告時間まであと ${remainMin} 分だ。`, 'lancelot_1.png');
            updateMeatCooldownUI();
            return;
        }

        if (inputVal < state.meatTotal) {
            setMeatLancelotMessage('団長、肉が減っているようだ。減らしたい場合は「肉数修正」を使ってくれ。', 'lancelot_5.png');
            return;
        }

        if (inputVal === state.meatTotal && !hasPendingRewards()) {
            setMeatLancelotMessage('前回と同じ数だな。新しく集めたらまた教えてくれ。', 'lancelot_1.png');
            return;
        }

        const diff = inputVal - state.meatTotal;

        if (diff >= 3000) {
            showCustomConfirm(
                `前回から ${diff.toLocaleString()}個 増えているぞ。\n現在の肉は ${inputVal.toLocaleString()}個 で間違いないか？\n\n※到達した報酬は今回すぐには配布されず、次の報告で解放できます。`,
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
            setMeatLancelotMessage('そんな肉数はあり得ないと思うが……修正する数字を確認してくれ。', 'lancelot_2.png');
            return;
        }

        const inputVal = Number(inputValStr);
        if (!Number.isSafeInteger(inputVal) || inputVal < 0) {
            setMeatLancelotMessage('修正する肉の個数を確認してくれ。', 'lancelot_2.png');
            return;
        }

        const oldTotal = state.meatTotal;
        state.meatTotal = inputVal;
        state.highestMeatTotal = Math.max(state.highestMeatTotal, inputVal);

        const canceled = cancelInvalidPendingRewards();

        // 修正では報酬を解放しない。条件到達分は次回の通常報告待ちにする。
        queueReachedRewards(false);

        input.value = '';
        saveGame();
        renderMeatPanel();

        let message = `肉数を ${oldTotal.toLocaleString()}個から ${inputVal.toLocaleString()}個に修正したぞ。`;
        if (canceled) {
            message += ' 条件を下回った未受取の報酬は取り消しておいた。';
        }
        setMeatLancelotMessage(message, inputVal < oldTotal ? 'lancelot_5.png' : 'lancelot_1.png');
    }

    function initMeatMode() {
        ensureMeatState();
        ensureMeatThemeStyle();

        if (syncExistingRewardState()) {
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
    window.closeMeatMode = closeMeatMode;
    window.reportMeat = reportMeat;
    window.fixMeat = fixMeat;
})();