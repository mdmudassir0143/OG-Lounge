import {
  Coins,
  Gamepad2,
  Globe,
  Heart,
  Lock,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "@/components/ui/feature-card";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto px-4">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-6 font-extrabold text-5xl text-gray-900 leading-tight md:text-7xl dark:text-white">
              The Future of Gaming is Decentralized
            </h1>
            <p className="mb-8 text-muted-foreground text-xl leading-relaxed md:text-2xl">
              Game Hub uses{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                blockchain
              </span>{" "}
              to give players true digital ownership of their games and assets,
              enabling secure trading, transparent revenue sharing, and
              cross-platform interoperability through Web3 wallets.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link className="inline-block" href="/marketplace">
                <button
                  className="rounded-xl bg-gray-900 px-8 py-4 font-semibold text-lg text-white shadow-sm transition-all duration-200 hover:shadow-md"
                  type="button"
                >
                  <Gamepad2 className="mr-2 inline h-5 w-5" />
                  Explore Games
                </button>
              </Link>
              <Link className="inline-block" href="/contact">
                <button
                  className="rounded-xl border-2 border-gray-200 px-8 py-4 font-semibold text-lg transition-all duration-200 hover:bg-gray-50"
                  type="button"
                >
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Blockchain Benefits */}
        <section className="py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl text-gray-900 md:text-4xl dark:text-white">
              Why Blockchain Changes Everything
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              By anchoring game progress and checkpoints on-chain, we prevent
              cheating and ensure authenticity, while smart contracts create a
              fair and trustless marketplace.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              description="Your games and assets belong to you permanently. Transfer them anywhere, anytime."
              gradientColor="#f3f4f6"
              icon={Shield}
              iconColor="text-blue-500"
              title="True Ownership"
            />
            <FeatureCard
              description="Trade game assets safely with transparent smart contract transactions."
              gradientColor="#f3f4f6"
              icon={Coins}
              iconColor="text-blue-500"
              title="Secure Trading"
            />
            <FeatureCard
              description="Use your Web3 wallet to access games across any platform or device."
              gradientColor="#f3f4f6"
              icon={Globe}
              iconColor="text-blue-500"
              title="Cross-Platform"
            />
            <FeatureCard
              description="On-chain checkpoints and progress validation ensure fair gameplay for everyone."
              gradientColor="#f3f4f6"
              icon={Lock}
              iconColor="text-blue-500"
              title="Anti-Cheat"
            />
            <FeatureCard
              description="Transparent, automated revenue distribution to creators and the community."
              gradientColor="#f3f4f6"
              icon={TrendingUp}
              iconColor="text-blue-500"
              title="Revenue Sharing"
            />
            <FeatureCard
              description="Vote on platform decisions and shape the future of Game Hub together."
              gradientColor="#f3f4f6"
              icon={Users}
              iconColor="text-blue-500"
              title="Community Governance"
            />
          </div>
        </section>

        {/* Decentralization Section */}
        <section className="py-16">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 font-bold text-3xl md:text-4xl">
                No Central Authority, <br />
                <span className="text-gray-100">Maximum Freedom</span>
              </h2>
              <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
                Blockchain removes reliance on central authorities and empowers
                the community with governance and long-term value in the gaming
                ecosystem. Smart contracts ensure fairness, transparency, and
                trust without intermediaries.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Zap className="mt-1 h-6 w-6 flex-shrink-0 text-gray-600" />
                  <div>
                    <h4 className="font-semibold">Instant Transactions</h4>
                    <p className="text-muted-foreground text-sm">
                      Lightning-fast asset transfers and game interactions.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="mt-1 h-6 w-6 flex-shrink-0 text-gray-600" />
                  <div>
                    <h4 className="font-semibold">Community First</h4>
                    <p className="text-muted-foreground text-sm">
                      Decisions made by players, for players through
                      decentralized governance.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-1 h-6 w-6 flex-shrink-0 text-gray-600" />
                  <div>
                    <h4 className="font-semibold">Innovation Unleashed</h4>
                    <p className="text-muted-foreground text-sm">
                      Build on top of our platform with complete creative
                      freedom.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-800 p-8 shadow-md">
                <h3 className="mb-3 font-bold text-gray-100 text-xl">
                  Trustless Marketplace
                </h3>
                <p className="text-gray-400">
                  Smart contracts automatically handle payments, royalties, and
                  ownership transfers without requiring trust in third parties.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-800 p-8 shadow-md">
                <h3 className="mb-3 font-bold text-gray-100 text-xl">
                  Immutable Records
                </h3>
                <p className="text-gray-400">
                  Game achievements, high scores, and asset ownership are
                  permanently recorded on the blockchain for complete
                  transparency.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-bold text-3xl md:text-4xl">
              Our Core Values
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              These principles guide everything we build and every decision we
              make as a community.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-400">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h4 className="mb-2 font-semibold text-xl">Be Helpful</h4>
              <p className="text-muted-foreground">
                We help creators learn and iterate quickly with kind, practical
                feedback and support.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-400">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h4 className="mb-2 font-semibold text-xl">Stay Focused</h4>
              <p className="text-muted-foreground">
                Small, focused experiences are easier to build, share, and
                iterate on than massive projects.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-400">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h4 className="mb-2 font-semibold text-xl">Open & Inclusive</h4>
              <p className="text-muted-foreground">
                We create an environment where anyone can join, contribute, and
                thrive regardless of background.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">
              Ready to Build the Future?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join our community of creators, players, and builders who are
              shaping the next generation of decentralized gaming.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link className="inline-block" href="/editor">
                <button
                  className="rounded-xl bg-gray-800 px-8 py-4 font-semibold text-lg text-white shadow-sm transition-all duration-300 hover:shadow-md"
                  type="button"
                >
                  <Sparkles className="mr-2 inline h-5 w-5 text-gray-100" />
                  Start Creating
                </button>
              </Link>
              <Link className="inline-block" href="/community">
                <button
                  className="rounded-xl border-2 border-gray-200 px-8 py-4 font-semibold text-lg transition-all duration-300 hover:bg-gray-50"
                  type="button"
                >
                  <Users className="mr-2 inline h-5 w-5 text-gray-700" />
                  Join Community
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
