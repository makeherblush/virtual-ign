// ==========================================
// MODUL BANK DIGITAL & TABUNGAN (BANK.JS)
// ==========================================

const BankModule = {
    renderBankAppUI() {
        const crest = window.gameState?.crest || 0;
        const savings = window.gameState?.economy?.savingsBalance || 0;
        const identity = window.gameState?.user?.identity || {};
        const bankAccount = window.gameState?.economy?.bankAccount || { accountNumber: 'CP-90128' };

        return `
            <div class="space-y-4">
                <!-- BLACK CARD UTAMA -->
                <div class="w-full h-44 rounded-3xl p-4 bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950 border border-amber-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-amber-400 uppercase tracking-widest">BANK CENTRAL IGNATIUS</span>
                        <i class="fa-solid fa-building-columns text-amber-400 text-base"></i>
                    </div>

                    <div>
                        <span class="text-[8px] text-slate-400 uppercase font-mono block">Saldo Rekening Utama</span>
                        <h2 class="text-2xl font-mono font-bold text-white tracking-wider">${crest.toLocaleString()} <span class="text-xs text-amber-400">Crest</span></h2>
                    </div>

                    <div class="flex justify-between items-end border-t border-white/10 pt-2 text-[9px]">
                        <div>
                            <span class="text-slate-500 block uppercase text-[7px]">Pemilik Rekening</span>
                            <span class="font-bold text-slate-200">${identity.fullName || 'Warga Ignatius'}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-slate-500 block uppercase text-[7px]">No. Rekening</span>
                            <span class="font-mono font-bold text-amber-300">${bankAccount.accountNumber}</span>
                        </div>
                    </div>
                </div>

                <!-- DOMPET TABUNGAN / DEPOSITO -->
                <div class="glass-ios p-4 rounded-3xl border border-emerald-500/30 space-y-3">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">💰 Saldo Tabungan Berbunga</span>
                            <h3 class="text-lg font-mono font-bold text-white">${savings.toLocaleString()} <span class="text-xs text-emerald-400">Crest</span></h3>
                        </div>
                        <span class="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[8px] font-bold rounded-lg border border-emerald-500/30">Bunga 5%/Shift</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 pt-1">
                        <button onclick="BankModule.depositSavingsPrompt()" class="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-arrow-down text-emerald-300"></i> Setor Tabungan
                        </button>
                        <button onclick="BankModule.withdrawSavingsPrompt()" class="py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-lg border border-white/10 flex items-center justify-center gap-1.5">
                            <i class="fa-solid fa-arrow-up text-amber-300"></i> Tarik Saldo
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    depositSavingsPrompt() {
        const amountStr = prompt("Masukkan Nominal Crest yang Mau Disimpan ke Tabungan:");
        if (!amountStr) return;
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0) {
            if (typeof showToast === 'function') showToast('Nominal tidak valid!', 'error');
            return;
        }

        if (window.gameState.crest < amount) {
            if (typeof showToast === 'function') showToast('Saldo Utama tidak cukup!', 'error');
            return;
        }

        window.gameState.crest -= amount;
        if (!window.gameState.economy.savingsBalance) window.gameState.economy.savingsBalance = 0;
        window.gameState.economy.savingsBalance += amount;

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Berhasil menyimpan ${amount.toLocaleString()} C ke Tabungan!`, 'success');
        openApp('bank');
    },

    withdrawSavingsPrompt() {
        const savings = window.gameState?.economy?.savingsBalance || 0;
        const amountStr = prompt(`Masukkan Nominal yang Mau Ditarik (Maks: ${savings.toLocaleString()} C):`);
        if (!amountStr) return;
        const amount = parseInt(amountStr);

        if (isNaN(amount) || amount <= 0 || amount > savings) {
            if (typeof showToast === 'function') showToast('Nominal tarik tidak valid!', 'error');
            return;
        }

        window.gameState.economy.savingsBalance -= amount;
        window.gameState.crest += amount;

        if (typeof window.saveState === 'function') window.saveState();
        if (typeof showToast === 'function') showToast(`Berhasil menarik ${amount.toLocaleString()} C ke Saldo Utama!`, 'success');
        openApp('bank');
    }
};

window.BankModule = BankModule;
