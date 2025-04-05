import { BarChart3, Link2, Shield, Zap } from "lucide-react"

export function Features() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container md:px-0">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl text-primary">Everything You Need</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl">
              Our URL shortener provides all the tools you need to create and manage your short links.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center space-y-2 rounded-lg border border-primary/20 p-6 hover:bg-primary/5 transition-colors">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Fast Shortening</h3>
            <p className="text-center text-gray-500">Create short links instantly with just a few clicks.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border border-primary/20 p-6 hover:bg-primary/5 transition-colors">
            <div className="rounded-full bg-primary/10 p-3">
              <Link2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Custom Links</h3>
            <p className="text-center text-gray-500">Create branded and customized short links.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border border-primary/20 p-6 hover:bg-primary/5 transition-colors">
            <div className="rounded-full bg-primary/10 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Click Analytics</h3>
            <p className="text-center text-gray-500">Track and analyze the performance of your links.</p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border border-primary/20 p-6 hover:bg-primary/5 transition-colors">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Links</h3>
            <p className="text-center text-gray-500">All links are secure and protected from spam.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

