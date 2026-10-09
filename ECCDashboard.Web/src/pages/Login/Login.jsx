import LoginForm from "../../components/LoginForm/LoginForm";

function Login() {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">

      {/* Left Side */}
      <section className="relative hidden overflow-hidden bg-slate-900 lg:flex">
        
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900" />

        {/* Decorative circles */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-blue-600 shadow-lg">
                ECC
              </div>

              <div>
                <p className="text-lg font-bold text-white">
                  ECC
                </p>
                <p className="text-xs text-blue-100">
                  Egyptian Company for Cosmetics
                </p>
              </div>
            </div>
          </div>

          {/* Main Text */}
          <div className="max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-200">
              Management System
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white xl:text-6xl">
              Manage your
              <span className="block text-blue-200">
                formulations
              </span>
              with confidence.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-blue-100">
              A centralized workspace for managing cosmetics,
              makeup products, formulations, and raw materials.
            </p>
          </div>

          {/* Footer */}
          <p className="text-sm text-blue-200">
            © 2026 ECC. All rights reserved.
          </p>

        </div>
      </section>

      {/* Right Side */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-16">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="mb-12 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                ECC
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  ECC
                </p>
                <p className="text-xs text-slate-500">
                  Egyptian Company for Cosmetics
                </p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to access your ECC Dashboard.
            </p>
          </div>

          <LoginForm />

        </div>

      </section>

    </main>
  );
}

export default Login;