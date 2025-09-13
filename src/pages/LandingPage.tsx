import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ParticleBackground } from '../components/ParticleBackground';
import { Button } from '../components/Button';
import { GlassmorphicCard } from '../components/GlassmorphicCard';
import { Database, Brain, ShieldAlert, ChevronDown } from 'lucide-react';
export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    scrollYProgress
  } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });
  const progressLine = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  return <div ref={containerRef} className="relative min-h-screen">
      <ParticleBackground />
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-4">
        <motion.div className="text-center max-w-4xl mx-auto" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }}>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
            Guarding the Integrity of Healthcare
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Leveraging AI to eliminate provider fraud and secure the future of
            medicine.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button to="/live-check" variant="solid">
              Run a Live Check
            </Button>
            <Button to="/bulk-analysis" variant="outline">
              Analyze Bulk Documents
            </Button>
          </div>
        </motion.div>
        <motion.div className="absolute bottom-12 left-1/2 transform -translate-x-1/2" animate={{
        y: [0, 10, 0]
      }} transition={{
        repeat: Infinity,
        duration: 2
      }}>
          <ChevronDown className="w-8 h-8 text-[#00BFFF]" />
        </motion.div>
      </section>
      {/* How It Works Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 className="text-4xl font-bold text-center mb-16" initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }}>
            How It Works
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Progress Line */}
            <motion.div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#00BFFF] to-[#33FFDD] hidden md:block" style={{
            width: '100%',
            scaleX: progressLine,
            originX: 0
          }} />
            {/* Step 1 */}
            <WorkflowStep icon={<Database className="w-12 h-12 text-[#00BFFF]" />} title="Ingest Data" description="Our system securely collects healthcare claims data from multiple sources." delay={0.1} />
            {/* Step 2 */}
            <WorkflowStep icon={<Brain className="w-12 h-12 text-[#00BFFF]" />} title="AI Analysis" description="Advanced algorithms analyze patterns and detect anomalies in provider behavior." delay={0.3} />
            {/* Step 3 */}
            <WorkflowStep icon={<ShieldAlert className="w-12 h-12 text-[#00BFFF]" />} title="Flag Anomalies" description="Suspicious claims are flagged and prioritized for investigation." delay={0.5} />
          </div>
        </div>
      </section>
      {/* Technology Showcase */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.h2 className="text-4xl font-bold text-center mb-16" initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }}>
            Powered By Advanced Technology
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {technologies.map((tech, index) => <TechCard key={tech.name} tech={tech} index={index} />)}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <GlassmorphicCard className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Secure Your Healthcare System?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Start analyzing your data today and protect your organization from
            fraud.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button to="/live-check" variant="solid">
              Run a Live Check
            </Button>
            <Button to="/bulk-analysis" variant="outline">
              Analyze Bulk Documents
            </Button>
          </div>
        </GlassmorphicCard>
      </section>
    </div>;
}
interface WorkflowStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}
function WorkflowStep({
  icon,
  title,
  description,
  delay
}: WorkflowStepProps) {
  return <motion.div className="flex flex-col items-center text-center" initial={{
    opacity: 0,
    y: 20
  }} whileInView={{
    opacity: 1,
    y: 0
  }} transition={{
    delay
  }} viewport={{
    once: true
  }}>
      <div className="mb-6 p-4 rounded-full bg-[#0A0F1A] border border-[#00BFFF]/30 shadow-lg shadow-[#00BFFF]/10 relative">
        <div className="absolute inset-0 rounded-full bg-[#00BFFF]/5 blur-md" />
        <div className="relative z-10">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </motion.div>;
}
interface Technology {
  name: string;
  icon: string;
}
const technologies: Technology[] = [{
  name: 'React',
  icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png'
}, {
  name: 'TensorFlow',
  icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Tensorflow_logo.svg/1200px-Tensorflow_logo.svg.png'
}, {
  name: 'Python',
  icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Python-logo-notext.svg/1200px-Python-logo-notext.svg.png'
}, {
  name: 'AWS',
  icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Amazon_Web_Services_Logo.svg/1200px-Amazon_Web_Services_Logo.svg.png'
}, {
  name: 'Docker',
  icon: 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png'
}, {
  name: 'MongoDB',
  icon: 'https://www.mongodb.com/assets/images/global/leaf.png'
}, {
  name: 'Node.js',
  icon: 'https://nodejs.org/static/images/logo.svg'
}, {
  name: 'GraphQL',
  icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/1200px-GraphQL_Logo.svg.png'
}];
interface TechCardProps {
  tech: Technology;
  index: number;
}
function TechCard({
  tech,
  index
}: TechCardProps) {
  return <motion.div className="bg-[#0A0F1A]/50 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center hover:border-[#00BFFF]/30 transition-all duration-300 group" initial={{
    opacity: 0,
    y: 20
  }} whileInView={{
    opacity: 1,
    y: 0
  }} transition={{
    delay: index * 0.1
  }} viewport={{
    once: true
  }} whileHover={{
    y: -5
  }}>
      <div className="w-16 h-16 mb-4 relative">
        <img src={tech.icon} alt={tech.name} className="w-full h-full object-contain" />
        <div className="absolute inset-0 bg-[#00BFFF]/0 group-hover:bg-[#00BFFF]/10 rounded-full blur-xl transition-all duration-300" />
      </div>
      <p className="font-medium">{tech.name}</p>
    </motion.div>;
}