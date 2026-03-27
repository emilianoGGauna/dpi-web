export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#080c12] text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-semibold">404</h1>
        <p className="mt-2 text-white/75">La ruta solicitada no existe.</p>
        <a href="/" className="mt-5 inline-block rounded-xl border border-white/20 px-4 py-2 hover:bg-white/10">Ir al inicio</a>
      </div>
    </main>
  );
}
