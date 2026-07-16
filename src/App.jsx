import React, { useState, useEffect } from "react";
import { Home, Receipt, PieChart as PieIcon, FileText, ArrowDownLeft, ArrowUpRight, Search, Filter, Download, ChevronRight, Plus, X, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, ResponsiveContainer } from "recharts";

// ---------- DATA CONTOH ----------
const SALDO_AWAL = 18194;

const KATEGORI = [
  { name: "Makan", value: 57, color: "#2F6F5E" },
  { name: "Belanja", value: 32, color: "#C9A24B" },
  { name: "Transportasi", value: 8, color: "#B5533C" },
  { name: "Lainnya", value: 3, color: "#8B8579" },
];

const HARIAN = [
  { hari: "Sab", jumlah: 180 },
  { hari: "Min", jumlah: 160 },
  { hari: "Sen", jumlah: 120 },
  { hari: "Sel", jumlah: 410 },
  { hari: "Rab", jumlah: 210 },
  { hari: "Kam", jumlah: 240 },
  { hari: "Jum", jumlah: 0 },
];

const TREN = [
  { tgl: "1 Mei", masuk: 6.0, keluar: 0.3 },
  { tgl: "2 Mei", masuk: 0.4, keluar: 0.2 },
  { tgl: "3 Mei", masuk: 0.2, keluar: 0.3 },
  { tgl: "4 Mei", masuk: 0.3, keluar: 0.4 },
  { tgl: "5 Mei", masuk: 10.4, keluar: 0.5 },
  { tgl: "6 Mei", masuk: 0.6, keluar: 0.3 },
  { tgl: "7 Mei", masuk: 0.3, keluar: 0.4 },
];

const INITIAL_TRANSAKSI = [
  { nama: "Nasi Padang", tgl: "7 Mei 2026", kat: "Makan", metode: "Cash", jumlah: -35000 },
  { nama: "Ayam Cajo", tgl: "7 Mei 2026", kat: "Makan", metode: "Cash", jumlah: -25000 },
  { nama: "Kopi Tuku", tgl: "7 Mei 2026", kat: "Makan", metode: "Cash", jumlah: -77000 },
  { nama: "Pakan Lele", tgl: "7 Mei 2026", kat: "Belanja", metode: "Cash", jumlah: -68000 },
  { nama: "Es Teh", tgl: "7 Mei 2026", kat: "Makan", metode: "Cash", jumlah: -5000 },
  { nama: "Gaji Bulanan", tgl: "1 Mei 2026", kat: "Gaji", metode: "Transfer", jumlah: 6000000 },
  { nama: "Ojek Online", tgl: "30 Apr 2026", kat: "Transportasi", metode: "E-wallet", jumlah: -18000 },
];

const rupiah = (n) => {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("id-ID");
  return (n < 0 ? "-Rp " : "Rp ") + s;
};

const BULAN_ID = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5, Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11 };
const parseTglID = (str) => {
  const [d, b, y] = str.split(" ");
  return new Date(Number(y), BULAN_ID[b] ?? 0, Number(d)).getTime();
};

const PALET_KATEGORI = ["#2F6F5E", "#C9A24B", "#B5533C", "#5B7B8C", "#A3763F", "#8B8579"];
function hitungKategori(transaksi) {
  const pengeluaranList = transaksi.filter((t) => t.jumlah < 0);
  const total = pengeluaranList.reduce((a, t) => a + Math.abs(t.jumlah), 0);
  if (!total) return [];
  const map = {};
  pengeluaranList.forEach((t) => {
    map[t.kat] = (map[t.kat] || 0) + Math.abs(t.jumlah);
  });
  return Object.entries(map)
    .map(([name, val], i) => ({ name, value: Math.round((val / total) * 100), color: PALET_KATEGORI[i % PALET_KATEGORI.length] }))
    .sort((a, b) => b.value - a.value);
}

function hitungTren(transaksi) {
  const map = {};
  transaksi.forEach((t) => {
    if (!map[t.tgl]) map[t.tgl] = { tgl: t.tgl, masuk: 0, keluar: 0 };
    if (t.jumlah > 0) map[t.tgl].masuk += t.jumlah / 1000000;
    else map[t.tgl].keluar += Math.abs(t.jumlah) / 1000000;
  });
  return Object.values(map).sort((a, b) => parseTglID(a.tgl) - parseTglID(b.tgl));
}

// ---------- ELEMEN VISUAL ----------
function Spine() {
  return (
    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 flex flex-col items-center py-6 gap-3 z-10">
      <div className="w-px h-full border-l border-dashed border-[#C9BFA8] absolute left-2" />
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#C9BFA8] relative z-10" />
      ))}
    </div>
  );
}

function TornEdge({ flip }) {
  return (
    <svg
      viewBox="0 0 400 12"
      preserveAspectRatio="none"
      className={`w-full h-3 ${flip ? "rotate-180" : ""}`}
    >
      <polygon
        points="0,0 400,0 400,12 380,4 360,10 340,3 320,9 300,2 280,11 260,5 240,9 220,2 200,10 180,4 160,11 140,3 120,9 100,2 80,10 60,4 40,11 20,3 0,9"
        fill="#F6F3EC"
      />
    </svg>
  );
}

function StatusPill({ text }) {
  return (
    <span className="text-[11px] tracking-wide uppercase text-[#2F6F5E] bg-[#E4EEE9] px-2.5 py-1 rounded-full font-medium">
      {text}
    </span>
  );
}

// ---------- LAYAR: BERANDA ----------
function Beranda({ goTo, transaksi, saldo, pemasukan, pengeluaran }) {
  return (
    <div className="pb-4">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] uppercase tracking-[0.15em] text-[#8B8579]">Saldo Total</span>
          <StatusPill text="Sehat" />
        </div>
        <div className="font-serif text-[40px] leading-none text-[#1B2A26] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          {rupiah(saldo)}
        </div>
        <p className="text-[13px] text-[#8B8579] mb-5">Seluruh transaksi tercatat rapi</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-[#EAF2EE] p-4">
            <div className="flex items-center gap-1.5 text-[#2F6F5E] mb-2">
              <ArrowDownLeft size={15} strokeWidth={2.5} />
              <span className="text-[11px] uppercase tracking-wide font-medium">Pemasukan</span>
            </div>
            <div className="text-[20px] font-semibold text-[#1B2A26]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Rp {(pemasukan / 1000000).toFixed(1)}jt
            </div>
          </div>
          <div className="rounded-2xl bg-[#F3E7E1] p-4">
            <div className="flex items-center gap-1.5 text-[#B5533C] mb-2">
              <ArrowUpRight size={15} strokeWidth={2.5} />
              <span className="text-[11px] uppercase tracking-wide font-medium">Pengeluaran</span>
            </div>
            <div className="text-[20px] font-semibold text-[#1B2A26]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Rp {(pengeluaran / 1000000).toFixed(1)}jt
            </div>
          </div>
        </div>
      </div>

      <TornEdge />

      <div className="px-6 pt-5">
        <h3 className="font-serif text-[17px] text-[#1B2A26] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          Pola 7 Hari Terakhir
        </h3>
        <p className="text-[12px] text-[#8B8579] mb-3">Total Rp 1.2jt</p>
        <div className="h-32 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HARIAN}>
              <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "#8B8579" }} axisLine={false} tickLine={false} />
              <Bar dataKey="jumlah" radius={[5, 5, 0, 0]}>
                {HARIAN.map((d, i) => (
                  <Cell key={i} fill={d.hari === "Sel" ? "#1B2A26" : "#2F6F5E"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-serif text-[17px] text-[#1B2A26]" style={{ fontFamily: "'Fraunces', serif" }}>
            Transaksi Terbaru
          </h3>
          <button onClick={() => goTo("transaksi")} className="text-[12px] text-[#2F6F5E] font-medium flex items-center gap-0.5">
            Lihat semua <ChevronRight size={13} />
          </button>
        </div>
        <div className="rounded-2xl border border-[#E7E1D3] overflow-hidden bg-white">
          {transaksi.slice(0, 4).map((t, i) => (
            <TxRow key={i} t={t} last={i === Math.min(3, transaksi.length - 1)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TxRow({ t, last, onDelete }) {
  const positif = t.jumlah > 0;
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${!last ? "border-b border-[#F0EBDD]" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${positif ? "bg-[#EAF2EE] text-[#2F6F5E]" : "bg-[#F3E7E1] text-[#B5533C]"}`}>
          {positif ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
        </div>
        <div>
          <div className="text-[14px] text-[#1B2A26] font-medium">{t.nama}</div>
          <div className="text-[11px] text-[#8B8579]">{t.tgl} · {t.kat} · {t.metode}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`text-[13px] font-semibold ${positif ? "text-[#2F6F5E]" : "text-[#B5533C]"}`}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {rupiah(t.jumlah)}
        </div>
        {onDelete && (
          <button onClick={onDelete} className="text-[#C9BFA8] p-1">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- LAYAR: TRANSAKSI ----------
function Transaksi({ transaksi, onDelete }) {
  const [q, setQ] = useState("");
  const filtered = transaksi.filter((t) => t.nama.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="px-6 pt-6 pb-4">
      <h2 className="font-serif text-[22px] text-[#1B2A26] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
        Semua Transaksi
      </h2>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E7E1D3] rounded-xl px-3 py-2.5">
          <Search size={15} className="text-[#8B8579]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari transaksi…"
            className="flex-1 text-[13px] text-[#1B2A26] bg-transparent outline-none placeholder:text-[#8B8579]"
          />
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#E7E1D3] bg-white text-[#2F6F5E]">
          <Filter size={15} />
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[13px] text-[#8B8579] text-center py-10">Belum ada transaksi yang cocok.</p>
      ) : (
        <div className="rounded-2xl border border-[#E7E1D3] overflow-hidden bg-white">
          {filtered.map((t, i) => (
            <TxRow
              key={i}
              t={t}
              last={i === filtered.length - 1}
              onDelete={() => onDelete(transaksi.indexOf(t))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- LAYAR: STATISTIK ----------
function Statistik({ kategori, tren, totalPengeluaran }) {
  return (
    <div className="px-6 pt-6 pb-4">
      <h2 className="font-serif text-[22px] text-[#1B2A26] mb-4" style={{ fontFamily: "'Fraunces', serif" }}>
        Statistik
      </h2>

      <div className="rounded-2xl border border-[#E7E1D3] bg-white p-5 mb-4">
        <h3 className="text-[13px] font-medium text-[#1B2A26] mb-3">Pengeluaran per Kategori</h3>
        {kategori.length === 0 ? (
          <p className="text-[13px] text-[#8B8579] py-4">Belum ada data pengeluaran.</p>
        ) : (
          <div className="flex items-center gap-5">
            <div className="w-28 h-28 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={kategori} dataKey="value" innerRadius={32} outerRadius={54} paddingAngle={2}>
                    {kategori.map((k, i) => (
                      <Cell key={i} fill={k.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[9px] text-[#8B8579] uppercase">Total</span>
                <span className="text-[13px] font-semibold text-[#1B2A26]">Rp{(totalPengeluaran / 1000000).toFixed(1)}jt</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {kategori.map((k, i) => (
                <div key={i} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: k.color }} />
                    <span className="text-[#1B2A26]">{k.name}</span>
                  </div>
                  <span className="text-[#8B8579]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{k.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#E7E1D3] bg-white p-5">
        <h3 className="text-[13px] font-medium text-[#1B2A26] mb-1">Tren Keuangan</h3>
        <p className="text-[11px] text-[#8B8579] mb-3">Berdasarkan tanggal transaksi (jutaan Rp)</p>
        {tren.length === 0 ? (
          <p className="text-[13px] text-[#8B8579] py-4">Belum ada transaksi.</p>
        ) : (
          <div className="h-36 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tren}>
                <XAxis dataKey="tgl" tick={{ fontSize: 10, fill: "#8B8579" }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="masuk" stroke="#2F6F5E" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="keluar" stroke="#B5533C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-[11px] text-[#8B8579]"><span className="w-2.5 h-0.5 bg-[#2F6F5E] inline-block" />Pemasukan</span>
          <span className="flex items-center gap-1.5 text-[11px] text-[#8B8579]"><span className="w-2.5 h-0.5 bg-[#B5533C] inline-block" />Pengeluaran</span>
        </div>
      </div>
    </div>
  );
}

// ---------- LAYAR: LAPORAN ----------
function Laporan({ saldo, pemasukan, pengeluaran, kategori, transaksi }) {
  const tanggalCetak = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const tglAwal = transaksi.length ? transaksi[transaksi.length - 1].tgl : "-";
  const tglAkhir = transaksi.length ? transaksi[0].tgl : "-";

  return (
    <div className="px-6 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <h2 className="font-serif text-[22px] text-[#1B2A26]" style={{ fontFamily: "'Fraunces', serif" }}>
          Laporan Keuangan
        </h2>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 text-[12px] font-medium text-white bg-[#1B2A26] px-3 py-2 rounded-xl"
        >
          <Download size={13} /> Unduh
        </button>
      </div>

      <div id="area-laporan" className="rounded-2xl border border-[#E7E1D3] bg-white p-5">
        <div className="flex items-center justify-between border-b-2 border-[#1B2A26] pb-3 mb-4">
          <div>
            <div className="font-serif text-[16px] text-[#1B2A26]" style={{ fontFamily: "'Fraunces', serif" }}>Buku Kas</div>
            <div className="text-[11px] text-[#8B8579]">Periode {tglAwal} – {tglAkhir}</div>
          </div>
          <div className="text-[10px] text-[#8B8579] text-right">Dicetak<br/>{tanggalCetak}</div>
        </div>

        <table className="w-full text-[13px] mb-5">
          <tbody>
            <tr className="border-b border-[#F0EBDD]">
              <td className="py-2 text-[#8B8579]">Saldo Awal</td>
              <td className="py-2 text-right font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{rupiah(SALDO_AWAL)}</td>
            </tr>
            <tr className="border-b border-[#F0EBDD]">
              <td className="py-2 text-[#8B8579]">Total Pemasukan</td>
              <td className="py-2 text-right font-medium text-[#2F6F5E]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>+{rupiah(pemasukan)}</td>
            </tr>
            <tr className="border-b border-[#F0EBDD]">
              <td className="py-2 text-[#8B8579]">Total Pengeluaran</td>
              <td className="py-2 text-right font-medium text-[#B5533C]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{rupiah(-pengeluaran)}</td>
            </tr>
            <tr>
              <td className="py-2.5 text-[#1B2A26] font-semibold">Saldo Akhir</td>
              <td className="py-2.5 text-right font-semibold text-[15px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{rupiah(saldo)}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-[11px] uppercase tracking-wide text-[#8B8579] mb-2">Rincian per Kategori</div>
        {kategori.length === 0 ? (
          <p className="text-[13px] text-[#8B8579] py-2">Belum ada data pengeluaran.</p>
        ) : (
          <table className="w-full text-[13px] mb-5">
            <tbody>
              {kategori.map((k, i) => (
                <tr key={i} className="border-b border-[#F0EBDD] last:border-0">
                  <td className="py-2 text-[#1B2A26] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: k.color }} />
                    {k.name}
                  </td>
                  <td className="py-2 text-right text-[#8B8579]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{k.value}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="text-[11px] uppercase tracking-wide text-[#8B8579] mb-2">Rincian Transaksi</div>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#1B2A26]">
              <th className="py-1.5 text-left font-medium text-[#8B8579]">Tanggal</th>
              <th className="py-1.5 text-left font-medium text-[#8B8579]">Nama</th>
              <th className="py-1.5 text-right font-medium text-[#8B8579]">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {transaksi.map((t, i) => (
              <tr key={i} className="border-b border-[#F0EBDD] last:border-0">
                <td className="py-1.5 text-[#8B8579]">{t.tgl}</td>
                <td className="py-1.5 text-[#1B2A26]">{t.nama}</td>
                <td
                  className={`py-1.5 text-right ${t.jumlah > 0 ? "text-[#2F6F5E]" : "text-[#B5533C]"}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {rupiah(t.jumlah)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-[#8B8579] text-center mt-4 leading-relaxed print:hidden">
        Laporan ini dibuat otomatis oleh Buku Kas.<br/>Data bersumber dari transaksi yang tercatat pada periode terkait.
      </p>
    </div>
  );
}

// ---------- FORM TAMBAH TRANSAKSI ----------
function FormTambah({ onClose, onSubmit }) {
  const [nama, setNama] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tipe, setTipe] = useState("keluar");
  const [kat, setKat] = useState(KATEGORI[0].name);
  const [metode, setMetode] = useState("Cash");
  const [error, setError] = useState("");

  const submit = () => {
    const nilai = Number(jumlah);
    if (!nama.trim()) return setError("Nama transaksi wajib diisi.");
    if (!nilai) return setError("Jumlah wajib diisi.");
    onSubmit({
      nama: nama.trim(),
      tgl: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      kat,
      metode,
      jumlah: tipe === "keluar" ? -Math.abs(nilai) : Math.abs(nilai),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-sm bg-[#F6F3EC] rounded-t-3xl p-6 pb-8 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-[18px] text-[#1B2A26]" style={{ fontFamily: "'Fraunces', serif" }}>
            Tambah Transaksi
          </h3>
          <button onClick={onClose} className="text-[#8B8579]">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTipe("keluar")}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium ${tipe === "keluar" ? "bg-[#B5533C] text-white" : "bg-white border border-[#E7E1D3] text-[#8B8579]"}`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setTipe("masuk")}
            className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium ${tipe === "masuk" ? "bg-[#2F6F5E] text-white" : "bg-white border border-[#E7E1D3] text-[#8B8579]"}`}
          >
            Pemasukan
          </button>
        </div>

        <label className="block text-[11px] uppercase tracking-wide text-[#8B8579] mb-1">Nama Transaksi</label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Contoh: Makan siang"
          className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3 py-2.5 text-[14px] mb-3 outline-none focus:border-[#2F6F5E]"
        />

        <label className="block text-[11px] uppercase tracking-wide text-[#8B8579] mb-1">Jumlah (Rp)</label>
        <input
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          inputMode="numeric"
          className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3 py-2.5 text-[14px] mb-3 outline-none focus:border-[#2F6F5E]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />

        <label className="block text-[11px] uppercase tracking-wide text-[#8B8579] mb-1">Kategori</label>
        <select
          value={kat}
          onChange={(e) => setKat(e.target.value)}
          className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3 py-2.5 text-[14px] mb-3 outline-none focus:border-[#2F6F5E]"
        >
          {KATEGORI.map((k) => (
            <option key={k.name} value={k.name}>{k.name}</option>
          ))}
          <option value="Gaji">Gaji</option>
          <option value="Lainnya">Lainnya</option>
        </select>

        <label className="block text-[11px] uppercase tracking-wide text-[#8B8579] mb-1">Metode</label>
        <select
          value={metode}
          onChange={(e) => setMetode(e.target.value)}
          className="w-full bg-white border border-[#E7E1D3] rounded-xl px-3 py-2.5 text-[14px] mb-2 outline-none focus:border-[#2F6F5E]"
        >
          <option>Cash</option>
          <option>Transfer</option>
          <option>E-wallet</option>
        </select>

        {error && <p className="text-[12px] text-[#B5533C] mb-3">{error}</p>}

        <button onClick={submit} className="w-full bg-[#1B2A26] text-white py-3 rounded-xl text-[14px] font-medium mt-3">
          Simpan Transaksi
        </button>
      </div>
    </div>
  );
}

// ---------- APP ----------
export default function BukuKasApp() {
  const [tab, setTab] = useState("beranda");
  const [transaksi, setTransaksi] = useState(INITIAL_TRANSAKSI);
  const [formOpen, setFormOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("buku-kas-transaksi");
      if (saved) setTransaksi(JSON.parse(saved));
    } catch (e) {
      // belum ada data tersimpan, pakai data awal
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("buku-kas-transaksi", JSON.stringify(transaksi));
    } catch (e) {
      console.error("Gagal menyimpan data:", e);
    }
  }, [transaksi, loaded]);

  const pemasukan = transaksi.filter((t) => t.jumlah > 0).reduce((a, t) => a + t.jumlah, 0);
  const pengeluaran = Math.abs(transaksi.filter((t) => t.jumlah < 0).reduce((a, t) => a + t.jumlah, 0));
  const saldo = SALDO_AWAL + pemasukan - pengeluaran;
  const kategoriData = hitungKategori(transaksi);
  const trenData = hitungTren(transaksi);

  const tambahTransaksi = (data) => setTransaksi((prev) => [data, ...prev]);
  const hapusTransaksi = (index) => setTransaksi((prev) => prev.filter((_, i) => i !== index));

  const NAV = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "transaksi", label: "Transaksi", icon: Receipt },
    { id: "statistik", label: "Statistik", icon: PieIcon },
    { id: "laporan", label: "Laporan", icon: FileText },
  ];

  return (
    <div className="w-full min-h-screen bg-[#F6F3EC] flex justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @media print {
          body * { visibility: hidden; }
          #area-laporan, #area-laporan * { visibility: visible; }
          #area-laporan { position: absolute; top: 0; left: 0; width: 100%; border: none; }
        }
      `}</style>

      <div className="relative w-full max-w-sm bg-[#F6F3EC] min-h-screen pl-4">
        <Spine />

        <header className="px-6 pt-7 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#1B2A26] flex items-center justify-center">
              <span className="text-[#F6F3EC] text-[13px] font-serif" style={{ fontFamily: "'Fraunces', serif" }}>B</span>
            </div>
            <span className="font-serif text-[16px] text-[#1B2A26] tracking-tight" style={{ fontFamily: "'Fraunces', serif" }}>
              Buku Kas
            </span>
          </div>
          <span className="text-[11px] text-[#8B8579] border border-[#E7E1D3] rounded-full px-2.5 py-1">Semua Waktu</span>
        </header>

        <main className="pb-24">
          {!loaded ? (
            <p className="text-[12px] text-[#8B8579] text-center py-10">Memuat data…</p>
          ) : (
            <>
              {tab === "beranda" && (
                <Beranda goTo={setTab} transaksi={transaksi} saldo={saldo} pemasukan={pemasukan} pengeluaran={pengeluaran} />
              )}
              {tab === "transaksi" && <Transaksi transaksi={transaksi} onDelete={hapusTransaksi} />}
              {tab === "statistik" && <Statistik kategori={kategoriData} tren={trenData} totalPengeluaran={pengeluaran} />}
              {tab === "laporan" && <Laporan saldo={saldo} pemasukan={pemasukan} pengeluaran={pengeluaran} kategori={kategoriData} transaksi={transaksi} />}
            </>
          )}
        </main>

        {(tab === "beranda" || tab === "transaksi") && (
          <button
            onClick={() => setFormOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-[#1B2A26] text-white flex items-center justify-center shadow-lg z-20"
          >
            <Plus size={22} />
          </button>
        )}

        {formOpen && <FormTambah onClose={() => setFormOpen(false)} onSubmit={tambahTransaksi} />}

        <nav className="fixed bottom-0 w-full max-w-sm bg-[#F6F3EC]/95 backdrop-blur border-t border-[#E7E1D3] px-4 py-2.5 flex justify-around">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <Icon size={19} strokeWidth={2} color={tab === id ? "#1B2A26" : "#B3AC9A"} />
              <span className={`text-[10px] ${tab === id ? "text-[#1B2A26] font-medium" : "text-[#B3AC9A]"}`}>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
