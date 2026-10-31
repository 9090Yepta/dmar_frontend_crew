import { Link } from '@tanstack/react-router';
import { LuArrowLeft, LuCompass } from 'react-icons/lu';

export function NotFoundPage() {
  return (
    <main className="grid min-h-[55svh] place-items-center py-8" aria-labelledby="not-found-title">
      <section className="card w-full max-w-xl border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body items-center p-6 text-center sm:p-10">
          <span className="grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
            <LuCompass className="size-8" aria-hidden="true" />
          </span>
          <span className="badge badge-primary badge-outline mt-2">ERROR 404</span>
          <h1 id="not-found-title" className="mt-1 text-2xl font-bold sm:text-3xl">
            Halaman tidak ditemukan
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-base-content/65">
            Alamat yang dibuka tidak tersedia atau sudah berubah. Kembali ke Home untuk melanjutkan.
          </p>
          <Link to="/" className="btn btn-primary mt-3 min-h-12 w-full sm:w-auto">
            <LuArrowLeft className="size-4" aria-hidden="true" />
            Kembali ke Home
          </Link>
        </div>
      </section>
    </main>
  );
}
