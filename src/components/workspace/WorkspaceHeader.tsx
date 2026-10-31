type ApiState = "loading" | "online" | "offline";

export function WorkspaceHeader({ api }: { api: ApiState }) {
  const label =
    api === "loading"
      ? "menghubungkan"
      : api === "online"
        ? "tersambung"
        : "belum aktif";

  return (
    <header className="topbar">
      <div className="brand-mark">D</div>
      <div>
        <p className="eyebrow">DMAR · WORKSPACE</p>
        <h1>Mekanika</h1>
      </div>
      <span className={`api-badge api-${api}`}>
        <span className="api-dot" /> API {label}
      </span>
    </header>
  );
}

export function WorkspaceIntro() {
  return (
    <section className="intro-card">
      <div className="intro-copy">
        <p className="eyebrow">RUANG KERJA MEKANIK</p>
        <h2>Catat pekerjaan. Pantau laporan.</h2>
        <p className="lead">
          Buat laporan pekerjaan dan pantau status persetujuannya dari satu
          tempat.
        </p>
      </div>
      <div className="illustration" aria-hidden="true">
        <span>⚙</span>
      </div>
    </section>
  );
}
