import { Brain, Heart, Zap, Target, Smile, TrendingUp } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { BlurFade } from "@/components/magicui/blur-fade";

const features = [
  {
    id: "mental-fitness",
    icon: Brain,
    title: "Mental Fitness",
    description:
      "Train your mind to overcome negative thoughts and boost your mental resilience.",
  },
  {
    id: "emotional-intelligence",
    icon: Heart,
    title: "Emotional Intelligence",
    description:
      "Develop a deeper understanding of your emotions and learn to manage them effectively.",
  },
  {
    id: "peak-performance",
    icon: Zap,
    title: "Peak Performance",
    description:
      "Unlock your full potential and achieve your goals with a positive mindset.",
  },
  {
    id: "goal-setting",
    icon: Target,
    title: "Goal Setting",
    description:
      "Learn to set and achieve meaningful goals that align with your values and aspirations.",
  },
  {
    id: "stress-management",
    icon: Smile,
    title: "Stress Management",
    description:
      "Discover techniques to reduce stress and maintain a calm, focused state of mind.",
  },
  {
    id: "personal-growth",
    icon: TrendingUp,
    title: "Personal Growth",
    description:
      "Embark on a journey of continuous self-improvement and lifelong learning.",
  },
].map((feature, index) => ({
  ...feature,
  animationDelay: index * 100,
}));

export default function Features() {
  return (
    <section id="features" className="relative py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20 -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <BlurFade className="text-center mb-16">
          <AnimatedShinyText>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Empower Your Mind
            </h2>
          </AnimatedShinyText>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover powerful tools and techniques to enhance your mental
            fitness and emotional intelligence.
          </p>
        </BlurFade>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <ShineBorder
              key={feature.id}
              duration={10}
              className="group relative backdrop-blur-sm rounded-xl overflow-hidden animate-in fade-in-0 duration-1000"
              borderWidth={1}
              color="rgba(var(--primary), 0.5)"
            >
              <div
                className="relative p-8"
                style={{ animationDelay: `${feature.animationDelay}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </ShineBorder>
          ))}
        </div>
      </div>
    </section>
  );
}
