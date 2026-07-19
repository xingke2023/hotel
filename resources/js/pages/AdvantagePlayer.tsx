import { Head, Link } from '@inertiajs/react';
import FrontendLayout from '@/layouts/frontend-layout';
import BottomNavigation from '@/components/BottomNavigation';
import { usePendingSalesCount } from '@/hooks/use-pending-sales-count';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

const css = `
  .lucky7-root {
    --bg:        #eef2f7;
    --bg2:       #f5f8fc;
    --bg3:       #e0e8f2;
    --surface:   #ffffff;
    --surface2:  #f5f8fc;
    --border:    #ccd8e8;
    --text:      #1a1a1a;
    --text-dim:  #888888;
    --gold:      #e6820a;
    --gold-light:#f0a030;
    --gold-dark: #b86200;
    --red:       #e03030;
    --red-bright:#e03030;
    --green:     #1aaa55;
    --green-bright: #1aaa55;
    --blue:      #1a73e8;
    font-family: 'Noto Sans SC', sans-serif;
    font-size: 16px;
    background: var(--bg);
    color: var(--text);
  }
  .lucky7-root * { box-sizing: border-box; }
  .lucky7-root .lk-container {
    max-width: 960px;
    margin: 0 auto;
    padding: 16px 12px 80px;
  }
  .lucky7-root header {
    text-align: center;
    padding: 12px 0 10px;
  }
  .lucky7-root .title-main {
    font-size: clamp(20px, 4vw, 30px);
    font-weight: 700;
    color: var(--text);
    line-height: 1.2;
  }
  .lucky7-root .nav-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
    margin-top: 8px;
  }
  .lucky7-root .nav-links a {
    font-size: 13px;
    color: var(--blue);
    text-decoration: none;
    padding: 3px 12px;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--surface);
  }
  .lucky7-root .main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  @media (max-width: 640px) {
    .lucky7-root .main-grid { grid-template-columns: 1fr; gap: 10px; }
  }
  .lucky7-root .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }
  .lucky7-root .card-header {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg2);
  }
  .lucky7-root .card-icon { font-size: 16px; }
  .lucky7-root .card-title { font-size: 14px; font-weight: 700; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.04em; }
  .lucky7-root .card-body { padding: 14px; }
  .lucky7-root .btn {
    padding: 10px 18px;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
  }
  .lucky7-root .btn-danger {
    background: #fff0f0;
    color: var(--red);
    border: 1px solid #ffcccc;
  }
  .lucky7-root .btn-danger:hover { background: #ffe0e0; }
  .lucky7-root .prob-rows-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
    margin-top: 6px;
  }
  .lucky7-root .prob-rows-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .lucky7-root .natural7-display {
    padding: 8px 10px;
    background: var(--bg3);
    border-radius: 6px;
    border-left: 3px solid var(--red-bright);
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .lucky7-root .ev-display { border-left-color: var(--gold); }
  .lucky7-root .three7-display { border-left-color: var(--green-bright); }
  .lucky7-root .combo7-display { border-left-color: var(--blue); }
  .lucky7-root .natural7-title { font-size: 13px; font-weight: 600; color: var(--text-dim); }
  .lucky7-root .natural7-prob {
    font-family: 'Cinzel', serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--red-bright);
  }
  .lucky7-root .three7-prob { color: var(--green-bright); }
  .lucky7-root .combo7-prob { color: var(--blue); font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; }
  .lucky7-root .ev-label { font-size: 13px; font-weight: 600; color: var(--text-dim); }
  .lucky7-root .ev-value { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; }
  .lucky7-root .ev-positive { color: var(--green-bright); }
  .lucky7-root .ev-negative { color: var(--red-bright); }
  .lucky7-root .deck-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  .lucky7-root .deck-cell {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 8px 4px 6px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .lucky7-root .deck-cell:hover { border-color: var(--gold); background: var(--bg3); transform: translateY(-1px); }
  .lucky7-root .deck-cell:active { transform: translateY(0); }
  .lucky7-root .deck-cell.depleted { opacity: 0.3; pointer-events: none; }
  .lucky7-root .deck-cell.low .deck-cell-count { color: #f0b429; }
  .lucky7-root .deck-cell-label { font-family: 'Cinzel', serif; font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .lucky7-root .deck-cell-count { font-size: 20px; font-weight: 700; color: var(--text); font-family: 'Cinzel', serif; }
  .lucky7-root .deck-cell-max { font-size: 12px; color: var(--text-dim); margin-top: 1px; }
  .lucky7-root .deck-total {
    margin-top: 8px;
    padding: 8px 12px;
    background: var(--bg3);
    border-radius: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--border);
  }
  .lucky7-root .deck-total-label { font-size: 14px; font-weight: 600; color: var(--text-dim); }
  .lucky7-root .deck-total-val { font-family: 'Cinzel', serif; font-size: 20px; font-weight: 700; color: var(--text); }
  .lucky7-root .status-bar {
    margin-top: 8px;
    min-height: 36px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transition: all 0.3s;
  }
  .lucky7-root .status-bar.show { opacity: 1; }
  .lucky7-root .status-success { background: rgba(63,185,80,0.1); border: 1px solid rgba(63,185,80,0.25); color: var(--green-bright); }
  .lucky7-root .status-error { background: rgba(231,76,60,0.1); border: 1px solid rgba(231,76,60,0.25); color: var(--red-bright); }
  .lucky7-root .status-info { background: rgba(240,180,41,0.08); border: 1px solid rgba(240,180,41,0.2); color: var(--gold); }
  .lucky7-root .history-wrap {
    max-height: 100px;
    overflow-y: auto;
    background: var(--bg2);
    border-radius: 6px;
    padding: 8px 10px;
    border: 1px solid var(--border);
  }
  .lucky7-root #history-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .lucky7-root .hist-chip {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-family: 'Cinzel', serif;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .lucky7-root .history-empty { color: var(--text-dim); font-size: 14px; }
  .lucky7-root .loading-overlay {
    position: fixed;
    inset: 0;
    background: rgba(240,242,245,0.88);
    z-index: 200;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .lucky7-root .loading-overlay.show { opacity: 1; pointer-events: all; }
  .lucky7-root .spinner {
    width: 36px; height: 36px;
    border: 2px solid rgba(0,0,0,0.1);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: lk7spin 0.8s linear infinite;
    margin-bottom: 10px;
  }
  @keyframes lk7spin { to { transform: rotate(360deg); } }
  .lucky7-root .loading-text { font-size: 13px; color: var(--text-dim); letter-spacing: 0.1em; }
`;

export default function AdvantagePlayer() {
    const { pendingSalesCount } = usePendingSalesCount();

    useEffect(() => {
        const API = '/lucky7-api';
        let history_cards: number[] = [];

        function getSid() { return localStorage.getItem('lucky7_sid') || ''; }
        function saveSid(sid: string) { if (sid) localStorage.setItem('lucky7_sid', sid); }

        function apiFetch(url: string, options: RequestInit = {}): Promise<any> {
            const sid = getSid();
            const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((options.headers as Record<string, string>) || {}) };
            if (sid) headers['X-Session-Id'] = sid;
            return fetch(url, { ...options, headers })
                .then(res => {
                    const newSid = res.headers.get('X-Session-Id');
                    if (newSid) saveSid(newSid);
                    return res.json();
                });
        }

        const CARD_MAX: Record<number, number> = { 0: 128, 1: 32, 2: 32, 3: 32, 4: 32, 5: 32, 6: 32, 7: 32, 8: 32, 9: 32 };

        function initDeckGrid() {
            const order = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
            const labels: Record<number, string> = { 0: '10/J', 1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9' };
            const grid = document.getElementById('lk7-deckGrid');
            if (!grid) return;
            grid.innerHTML = '';
            for (const v of order) {
                const cell = document.createElement('div');
                cell.className = 'deck-cell';
                cell.id = `dc-${v}`;
                cell.title = '点击移除一张';
                cell.innerHTML = `
                  <div class="deck-cell-label">${labels[v]}</div>
                  <div class="deck-cell-count" id="dcc-${v}">${CARD_MAX[v]}</div>
                  <div class="deck-cell-max">/ ${CARD_MAX[v]}</div>`;
                cell.addEventListener('click', () => removeOneCard(v));
                grid.appendChild(cell);
            }
        }

        function updateDeckUI(deck: Record<string, number>) {
            let total = 0;
            for (const v in deck) {
                const count = deck[v] || 0;
                total += count;
                const el = document.getElementById(`dcc-${v}`);
                const cell = document.getElementById(`dc-${v}`);
                if (el && cell) {
                    el.textContent = String(count);
                    cell.classList.toggle('depleted', count === 0);
                    cell.classList.toggle('low', count > 0 && count <= Math.floor(CARD_MAX[parseInt(v)] * 0.2));
                }
            }
            const tot = document.getElementById('lk7-deckTotal');
            if (tot) tot.textContent = String(total);
        }

        function updateProbUI(result: any) {
            if (!result) return;
            const evEl = document.getElementById('lk7-evValue');
            if (evEl) {
                evEl.textContent = result.ev.toFixed(4);
                evEl.className = 'ev-value ' + (result.ev >= 1 ? 'ev-positive' : 'ev-negative');
            }
            const fields: Record<string, string> = {
                evNatural7: 'lk7-natural7Ev',
                evThree7: 'lk7-three7Ev',
                evCombo: 'lk7-comboEv',
                evBanker6Two: 'lk7-banker6TwoEv',
                evBanker6Three: 'lk7-banker6ThreeEv',
                evBanker6Combo: 'lk7-banker6ComboEv',
            };
            for (const [key, id] of Object.entries(fields)) {
                if (result[key] !== undefined) {
                    const el = document.getElementById(id);
                    if (el) el.textContent = result[key].toFixed(4);
                }
            }
        }

        function updateHistoryUI(cards: number[]) {
            const list = document.getElementById('lk7-history-list');
            const cnt = document.getElementById('lk7-histCount');
            if (cnt) cnt.textContent = cards.length + ' 张';
            if (!list) return;
            if (cards.length === 0) {
                list.innerHTML = '<span class="history-empty">尚未输入任何牌</span>';
                return;
            }
            list.innerHTML = cards.map(v => {
                const label = v === 0 ? '10' : (v === 1 ? 'A' : v);
                return `<div class="hist-chip">${label}</div>`;
            }).join('');
            const wrap = list.parentElement;
            if (wrap) wrap.scrollTop = wrap.scrollHeight;
        }

        let statusTimer: ReturnType<typeof setTimeout>;
        function showStatus(msg: string, type = 'info') {
            const bar = document.getElementById('lk7-statusBar');
            const wrap = document.getElementById('lk7-deckTotalWrap');
            if (!bar) return;
            bar.className = `status-bar status-${type} show`;
            bar.innerHTML = (type === 'success' ? '✓ ' : type === 'error' ? '✗ ' : '◆ ') + msg;
            if (wrap) wrap.style.display = 'none';
            clearTimeout(statusTimer);
            statusTimer = setTimeout(() => {
                bar.classList.remove('show');
                if (wrap) wrap.style.display = '';
            }, 3000);
        }

        function setLoading(show: boolean) {
            const el = document.getElementById('lk7-loadingOverlay');
            if (el) el.classList.toggle('show', show);
        }

        async function removeOneCard(v: number) {
            setLoading(true);
            try {
                const data = await apiFetch(`${API}/remove`, {
                    method: 'POST',
                    body: JSON.stringify({ cards: [v] }),
                });
                if (data.failed && data.failed.length > 0) {
                    showStatus('已无剩余，无法移除', 'error');
                    return;
                }
                const label = v === 0 ? '10-K' : v === 1 ? 'A' : v;
                showStatus(`已移除 ${label}`, 'success');
                history_cards = history_cards.concat(data.removed || []);
                updateDeckUI(data.deck);
                updateProbUI(data.result);
                updateHistoryUI(history_cards);
            } catch {
                showStatus('网络错误', 'error');
            } finally {
                setLoading(false);
            }
        }

        async function resetDeck() {
            if (!confirm('确认重置牌靴为全新8副牌？')) return;
            setLoading(true);
            try {
                const data = await apiFetch(`${API}/reset`, { method: 'POST' });
                history_cards = [];
                updateDeckUI(data.deck);
                updateProbUI(data.result);
                updateHistoryUI([]);
                showStatus('牌靴已重置（416张）', 'info');
            } catch {
                showStatus('重置失败', 'error');
            } finally {
                setLoading(false);
            }
        }

        (window as any).lk7ResetDeck = resetDeck;

        initDeckGrid();
        apiFetch(`${API}/calc`)
            .then(data => {
                updateDeckUI(data.deck);
                updateProbUI(data.result);
            })
            .catch(() => {
                showStatus('无法连接后端服务', 'error');
            });

        return () => {
            delete (window as any).lk7ResetDeck;
            clearTimeout(statusTimer);
        };
    }, []);

    return (
        <FrontendLayout>
            <Head title="优势玩家" />
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="lucky7-root min-h-screen pb-20">
                <div id="lk7-loadingOverlay" className="loading-overlay">
                    <div className="spinner"></div>
                    <div className="loading-text">CALCULATING · 计算中</div>
                </div>

                {/* Page Header */}
                <div className="bg-white sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center gap-3">
                    <Link
                        href="/articles"
                        className="p-2 -ml-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <span className="font-bold text-gray-900 text-lg">优势玩家</span>
                </div>

                <div className="lk-container">
                    <header>
                        <h1 className="title-main">幸运6幸运7概率计算器</h1>
                        <div className="nav-links">
                            <a href="/dragon-bonus.html">龙宝概率计算器 →</a>
                            <a href="/dragon-sim.html">龙宝下注统计 →</a>
                            <a href="/simulate.html">随机发牌模拟 →</a>
                            <a href="/lucky7-sim.html">幸运7下注统计 →</a>
                            <a href="/s7-impact.html">幸运7牌值影响 →</a>
                            <a href="/lucky6-three-sim.html">幸运6三张牌统计 →</a>
                            <a href="/lucky6-two-sim.html">幸运6两张牌统计 →</a>
                            <a href="/lucky6-impact.html">幸运6牌值影响 →</a>
                            <a href="/card-counting.html">算牌一级策略 →</a>
                        </div>
                    </header>

                    <div className="main-grid mt-4">
                        {/* 期望值卡片 */}
                        <div className="card">
                            <div className="card-header">
                                <span className="card-icon">📊</span>
                                <span className="card-title">期望值</span>
                            </div>
                            <div className="card-body">
                                <div className="prob-rows-grid">
                                    <div className="natural7-display ev-display">
                                        <div className="ev-label">超级7：</div>
                                        <div className="ev-value ev-negative" id="lk7-evValue">—</div>
                                    </div>
                                    <div className="natural7-display">
                                        <div className="natural7-title">闲7两张：</div>
                                        <div className="natural7-prob" id="lk7-natural7Ev">—</div>
                                    </div>
                                    <div className="natural7-display three7-display">
                                        <div className="natural7-title">闲7三张：</div>
                                        <div className="natural7-prob three7-prob" id="lk7-three7Ev">—</div>
                                    </div>
                                    <div className="natural7-display combo7-display">
                                        <div className="natural7-title">闲7组合：</div>
                                        <div className="combo7-prob" id="lk7-comboEv">—</div>
                                    </div>
                                </div>
                                <div className="prob-rows-grid prob-rows-grid-3 mt-2">
                                    <div className="natural7-display">
                                        <div className="natural7-title">庄6两张：</div>
                                        <div className="natural7-prob" id="lk7-banker6TwoEv">—</div>
                                    </div>
                                    <div className="natural7-display three7-display">
                                        <div className="natural7-title">庄6三张：</div>
                                        <div className="natural7-prob three7-prob" id="lk7-banker6ThreeEv">—</div>
                                    </div>
                                    <div className="natural7-display combo7-display">
                                        <div className="natural7-title">庄6组合：</div>
                                        <div className="combo7-prob" id="lk7-banker6ComboEv">—</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 牌靴状态卡片 */}
                        <div className="card">
                            <div className="card-header">
                                <span className="card-icon">🀄</span>
                                <span className="card-title">牌靴剩余（点击移除一张）</span>
                                <button
                                    className="btn btn-danger"
                                    style={{ marginLeft: 'auto', padding: '4px 12px', fontSize: '12px' }}
                                    onClick={() => (window as any).lk7ResetDeck?.()}
                                >
                                    重置
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="deck-grid" id="lk7-deckGrid"></div>
                                <div id="lk7-deckTotalWrap" className="deck-total">
                                    <span className="deck-total-label">剩余总张数</span>
                                    <span className="deck-total-val" id="lk7-deckTotal">416</span>
                                </div>
                                <div className="status-bar" id="lk7-statusBar"></div>
                            </div>
                        </div>
                    </div>

                    {/* 历史记录 */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-icon">📜</span>
                            <span className="card-title">已移除记录</span>
                            <span id="lk7-histCount" style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-dim)' }}>0 张</span>
                        </div>
                        <div className="card-body">
                            <div className="history-wrap">
                                <div id="lk7-history-list">
                                    <span className="history-empty">尚未输入任何牌</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <BottomNavigation pendingSalesCount={pendingSalesCount} />
            </div>
        </FrontendLayout>
    );
}
