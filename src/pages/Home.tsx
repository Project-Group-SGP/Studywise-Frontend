import Navbar from "@/components/Navbar";

import { Button } from "@/components/ui/button";
import { HeroParallax } from "@/components/ui/hero-parallax";
import { FeatureCard } from "@/components/feature-card";
import {
  Users,
  BookOpen,
  MessageSquare,
  Calendar,
  PenTool,
  FileText,
  BrainCircuit,
  Rocket,
} from "lucide-react";
import DeveloperSection from "@/components/DeveloperSection";

function Home() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <HeroParallax>
          <section className="relative px-4 py-20 md:py-32">
            <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
              <div className="container mx-auto text-center">
                <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                  Study Together,{" "}
                  <span className="text-primary">Achieve Together</span>
                </h1>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Join a community of learners. Form study groups, share notes,
                  and collaborate in real-time with our comprehensive learning
                  platform.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row justify-center">
                  <Button size="lg" className="text-lg">
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </HeroParallax>

        {/* Features Section */}
        <section className="px-4 py-16 bg-muted/50">
          <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Everything You Need to Excel
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                  title="Study Groups"
                  description="Create or join study groups based on your courses, interests, or goals."
                  icon={<Users className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Note Sharing"
                  description="Share and access course notes, summaries, and study materials."
                  icon={<BookOpen className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Real-time Chat"
                  description="Communicate with your study group members instantly through integrated chat."
                  icon={<MessageSquare className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Session Scheduling"
                  description="Plan study sessions and get automatic reminders for upcoming meetings."
                  icon={<Calendar className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Virtual Whiteboard"
                  description="Brainstorm ideas and explain concepts using our collaborative whiteboard."
                  icon={<PenTool className="h-6 w-6" />}
                />
                <FeatureCard
                  title="Document Sharing"
                  description="Share and collaborate on documents in real-time with version control."
                  icon={<FileText className="h-6 w-6" />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-4 py-16">
          <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                How It Works
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Users className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Create Your Group
                  </h3>
                  <p className="text-muted-foreground">
                    Start a study group or join existing ones that match your
                    interests
                  </p>
                </div>
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <BrainCircuit className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
                  <p className="text-muted-foreground">
                    Share notes, use the whiteboard, and chat with group members
                  </p>
                </div>
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Rocket className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Excel Together</h3>
                  <p className="text-muted-foreground">
                    Achieve your academic goals through collaborative learning
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="px-4 py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Learning Together?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
            Join thousands of students who are already experiencing the power of
            collaborative learning.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg"
          >
            Sign Up Now
          </Button>
        </div>
      </section> */}

        <DeveloperSection />
      </div>
    </>
  );
}

export default Home;
