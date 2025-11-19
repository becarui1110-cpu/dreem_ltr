export default function ExpiredPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="bg-slate-900/60 p-8 rounded-2xl max-w-md text-center space-y-4 shadow-lg">
        <h1 className="text-2xl font-bold">Lien expiré</h1>
        <p className="text-slate-300">
          Ce lien d’accès n’est plus valide. Demande un nouveau lien sur mycaradvisor.ch !
        </p>
      </div>
    </main>
  );
}
