// @ts-nocheck
import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Trail, Stars, Sphere as DreiSphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Activity, ChevronLeft, Info, Search, Sparkles, MessageSquare, Layers, Database, MousePointer2, Video, Play, ExternalLink, RefreshCw, Sun } from 'lucide-react';
import { askStudyAssistant, generateVisualVideo } from '../services/aiService';

// DNA Component
function DNA({ wireframe }: { wireframe: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  const basePairs = 20;
  const atoms = useMemo(() => {
    const temp = [];
    for (let i = 0; i < basePairs; i++) {
      const y = (i - basePairs / 2) * 0.8;
      const angle = i * 0.5;
      const x1 = Math.cos(angle) * 2;
      const z1 = Math.sin(angle) * 2;
      const x2 = Math.cos(angle + Math.PI) * 2;
      const z2 = Math.sin(angle + Math.PI) * 2;
      temp.push({ id: `a-${i}`, pos: [x1, y, z1], color: '#C5A267' });
      temp.push({ id: `b-${i}`, pos: [x2, y, z2], color: '#31333E' });
    }
    return temp;
  }, []);

  return (
    <group ref={ref}>
      {atoms.map((atom) => (
        <DreiSphere key={atom.id} position={atom.pos as any} args={[0.2, 16, 16]}>
          <meshStandardMaterial color={atom.color} emissive={atom.color} emissiveIntensity={0.5} wireframe={wireframe} />
        </DreiSphere>
      ))}
      {Array.from({ length: basePairs }).map((_, i) => {
        const y = (i - basePairs / 2) * 0.8;
        const angle = i * 0.5;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[4, 0.05, 0.05]} />
            <meshStandardMaterial color="#2A2D35" wireframe={wireframe} />
          </mesh>
        );
      })}
    </group>
  );
}

// Bohr Atom Component
function BohrAtom({ wireframe }: { wireframe: boolean }) {
  const electronRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (electronRef.current) {
      const t = state.clock.getElapsedTime() * 2;
      electronRef.current.position.x = Math.cos(t) * 3;
      electronRef.current.position.z = Math.sin(t) * 3;
    }
  });

  return (
    <group>
      <DreiSphere args={[1, 32, 32]}>
        <meshStandardMaterial color="#C5A267" emissive="#C5A267" emissiveIntensity={0.2} wireframe={wireframe} />
      </DreiSphere>
      <group rotation={[Math.PI / 2.5, 0, 0]}>
        <mesh>
          <torusGeometry args={[3, 0.02, 16, 100]} />
          <meshStandardMaterial color="#2A2D35" wireframe={wireframe} />
        </mesh>
        <DreiSphere ref={electronRef} args={[0.2, 16, 16]}>
          <meshStandardMaterial color="#FFFFFF" wireframe={wireframe} />
        </DreiSphere>
      </group>
      <group rotation={[-Math.PI / 2.5, 0, 0]}>
        <mesh>
          <torusGeometry args={[4.5, 0.02, 16, 100]} />
          <meshStandardMaterial color="#2A2D35" wireframe={wireframe} />
        </mesh>
      </group>
    </group>
  );
}

// Math Coordinate Flow
function MathVisual({ wireframe }: { wireframe: boolean }) {
  const points = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      const t = (i / 100) * Math.PI * 4;
      temp.push(new THREE.Vector3(Math.cos(t) * (i / 10), Math.sin(t) * (i / 10), (i - 50) / 10));
    }
    return temp;
  }, []);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  return (
    <group>
      <gridHelper args={[20, 20, '#2A2D35', '#14161B']} rotation={[Math.PI / 2, 0, 0]} />
      <Trail width={1} length={20} color="#C5A267" attenuation={(t) => t * t}>
        <Float speed={2} rotationIntensity={2}>
           <DreiSphere args={[0.1, 8, 8]}>
             <meshStandardMaterial color="#C5A267" wireframe={wireframe} />
           </DreiSphere>
        </Float>
      </Trail>
      <mesh>
        <tubeGeometry args={[curve, 100, 0.05, 8, false]} />
        <meshStandardMaterial color="#C5A267" opacity={0.3} transparent wireframe={wireframe} />
      </mesh>
    </group>
  );
}

// Plant Cell Component (Class 11/12 Biology)
function PlantCell({ wireframe }: { wireframe: boolean }) {
  return (
    <group>
      {/* Cell Wall */}
      <mesh>
        <boxGeometry args={[5, 6, 5]} />
        <meshStandardMaterial color="#1a4d1a" opacity={0.4} transparent wireframe={wireframe} />
      </mesh>
      {/* Large Vacuole */}
      <DreiSphere args={[1.5, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#4da6ff" opacity={0.6} transparent wireframe={wireframe} />
      </DreiSphere>
      {/* Nucleus */}
      <DreiSphere args={[0.6, 32, 32]} position={[1.5, 1.5, 0]}>
        <meshStandardMaterial color="#993399" wireframe={wireframe} />
      </DreiSphere>
      {/* Chloroplasts */}
      {[...Array(6)].map((_, i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 3) * 2,
          Math.sin(i * Math.PI / 3) * 2,
          1.5
        ]}>
          <capsuleGeometry args={[0.2, 0.5, 4, 8]} />
          <meshStandardMaterial color="#00ff00" wireframe={wireframe} />
        </mesh>
      ))}
    </group>
  );
}

// Bacteria Cell Component (Class 11/12 Biology)
function BacteriaCell({ wireframe }: { wireframe: boolean }) {
  const flagellaRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (flagellaRef.current) {
      flagellaRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 5) * 0.2;
    }
  });

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      {/* Capsule */}
      <mesh>
        <capsuleGeometry args={[1, 3, 16, 32]} />
        <meshStandardMaterial color="#8b0000" opacity={0.7} transparent wireframe={wireframe} />
      </mesh>
      {/* Nucleoid (DNA) */}
      <mesh position={[0, 0, 0]}>
        <torusKnotGeometry args={[0.5, 0.1, 100, 16]} />
        <meshStandardMaterial color="#ffd700" wireframe={wireframe} />
      </mesh>
      {/* Flagella */}
      <group ref={flagellaRef} position={[0, -2.5, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.01, 3, 8]} />
          <meshStandardMaterial color="#555" wireframe={wireframe} />
        </mesh>
      </group>
    </group>
  );
}

// Krebs Cycle Component (Class 11/12 Biology)
function KrebsCycle({ wireframe }: { wireframe: boolean }) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { name: 'Citrate', color: '#ffcc00' },
    { name: 'Isocitrate', color: '#ff9900' },
    { name: 'Alpha-Ketoglutarate', color: '#ff6600' },
    { name: 'Succinyl-CoA', color: '#ff3300' },
    { name: 'Succinate', color: '#cc00cc' },
    { name: 'Fumarate', color: '#6600ff' },
    { name: 'Malate', color: '#0066ff' },
    { name: 'Oxaloacetate', color: '#00ccff' }
  ];

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (Math.floor(t % steps.length) !== activeStep) {
      setActiveStep(Math.floor(t % steps.length));
    }
  });

  return (
    <group>
      {/* Central Matrix */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[4, 0.05, 16, 100]} />
        <meshStandardMaterial color="#2A2D35" wireframe={wireframe} />
      </mesh>

      {steps.map((step, i) => {
        const angle = (i / steps.length) * Math.PI * 2;
        const x = Math.cos(angle) * 4;
        const z = Math.sin(angle) * 4;
        return (
          <group key={i} position={[x, 0, z]}>
            <DreiSphere args={[0.4, 16, 16]}>
              <meshStandardMaterial 
                color={step.color} 
                emissive={step.color} 
                emissiveIntensity={activeStep === i ? 1 : 0.2} 
                wireframe={wireframe} 
              />
            </DreiSphere>
            <Text
              position={[0, 0.8, 0]}
              fontSize={0.2}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {step.name}
            </Text>
          </group>
        );
      })}

      {/* Energy Carrier (NADH/FADH2) animation */}
      <Float speed={5} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[Math.cos(activeStep) * 2, 1, Math.sin(activeStep) * 2]}>
          <octahedronGeometry args={[0.2, 0]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" />
        </mesh>
      </Float>
    </group>
  );
}

// Photosynthesis Component (Class 11/12 Biology)
function Photosynthesis({ wireframe }: { wireframe: boolean }) {
  const photonRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (photonRef.current) {
      photonRef.current.position.y = 5 - (state.clock.getElapsedTime() % 3) * 3;
      photonRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 2) * 2;
    }
  });

  return (
    <group>
      {/* Thylakoid Membrane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <boxGeometry args={[10, 10, 0.2]} />
        <meshStandardMaterial color="#1a4d1a" wireframe={wireframe} />
      </mesh>

      {/* PSII */}
      <group position={[-3, -0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[1, 1, 1, 32]} />
          <meshStandardMaterial color="#00aa00" wireframe={wireframe} />
        </mesh>
        <Text position={[0, 1, 0]} fontSize={0.3} color="white">PS II</Text>
      </group>

      {/* PSI */}
      <group position={[3, -0.5, 0]}>
        <mesh>
          <cylinderGeometry args={[1, 1, 1, 32]} />
          <meshStandardMaterial color="#008800" wireframe={wireframe} />
        </mesh>
        <Text position={[0, 1, 0]} fontSize={0.3} color="white">PS I</Text>
      </group>

      {/* Photons (Light) */}
      <group ref={photonRef}>
        {[...Array(5)].map((_, i) => (
          <DreiSphere key={i} args={[0.1, 8, 8]} position={[i - 2, 0, 0]}>
            <meshStandardMaterial color="yellow" emissive="yellow" />
          </DreiSphere>
        ))}
      </group>

      {/* Electron Flow Trail */}
      <Trail width={1} length={10} color="cyan">
        <Float speed={10} rotationIntensity={0}>
          <mesh position={[Math.sin(Date.now() * 0.001) * 3, -0.2, 0]}>
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial color="cyan" emissive="cyan" />
          </mesh>
        </Float>
      </Trail>
    </group>
  );
}

// Topic Explainer 3D Text
function TopicText({ topic }: { topic: string }) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        fontSize={0.8}
        color="#C5A267"
        font="https://fonts.gstatic.com/s/playfairdisplay/v30/6NU78965Qgo69neH9G10aE2uU0pXv25Z0A.woff"
        maxWidth={8}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
      >
        {topic}
      </Text>
    </Float>
  );
}

interface VisualLabProps {
  onBack: () => void;
}

export default function VisualLab({ onBack }: VisualLabProps) {
  const [activeModel, setActiveModel] = useState<'dna' | 'atom' | 'math' | 'explain' | 'plant' | 'bacteria' | 'krebs' | 'photosynthesis'>('dna');
  const [topicInput, setTopicInput] = useState("");
  const [topicResult, setTopicResult] = useState<{ topic: string, explanation: string } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleExplainTopic = async () => {
    if (!topicInput.trim()) return;
    setIsExplaining(true);
    setActiveModel('explain');
    const response = await askStudyAssistant(`Explain the following academic concept in a spatial/structural context for a 3D visualization: ${topicInput}`);
    setTopicResult({ topic: topicInput, explanation: response.text });
    setIsExplaining(false);
  };

  const handleGenerateVideo = async () => {
    setIsVideoLoading(true);
    setGeneratedVideo(null);
    
    let modelName = "";
    let description = "";

    switch(activeModel) {
      case 'dna': modelName = "B-DNA Helix"; description = "A detailed 3D double helix model of DNA with rotating animation."; break;
      case 'atom': modelName = "Bohr Atomic Model"; description = "An atom with a nucleus and electrons orbiting in shells."; break;
      case 'math': modelName = "Parametric Math Curves"; description = "A complex 3D mathematical curve visualization with trails."; break;
      case 'plant': modelName = "Plant Cell"; description = "A 3D cross section of a plant cell showing organelles."; break;
      case 'bacteria': modelName = "Bacteria Cell"; description = "A Prokaryotic cell with flagella and nucleoid."; break;
      case 'krebs': modelName = "Krebs Cycle"; description = "The Citric Acid Cycle showing the metabolic pathway in the mitochondria."; break;
      case 'photosynthesis': modelName = "Photosynthesis"; description = "The Light Reactions taking place in the thylakoid membrane."; break;
      case 'explain': modelName = topicResult?.topic || "Scientific Concept"; description = topicResult?.explanation || ""; break;
    }

    const videoUrl = await generateVisualVideo(modelName, description);
    setGeneratedVideo(videoUrl);
    setIsVideoLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-bg-dark flex flex-col">
      <header className="p-6 border-b border-border-dark flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-item-dark rounded-xl transition-colors text-text-secondary"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-brand-gold">Interactive 3D Lab</h2>
            <p className="text-xs text-text-secondary">Explore complex concepts through simulation</p>
          </div>
        </div>
        
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`p-2 rounded-xl transition-all border ${
              wireframe ? 'bg-brand-gold/20 border-brand-gold text-brand-gold' : 'bg-item-dark border-border-dark text-text-secondary hover:bg-border-dark'
            }`}
            title="Toggle Wireframe"
          >
            <Layers className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-border-dark mx-2" />
          <button
            onClick={handleGenerateVideo}
            disabled={isVideoLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
              isVideoLoading ? 'bg-item-dark border-border-dark opacity-50' : 'bg-brand-gold text-bg-dark border-brand-gold font-bold hover:scale-105 shadow-lg shadow-brand-gold/20'
            }`}
          >
            {isVideoLoading ? (
              <div className="w-4 h-4 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
            ) : <Video className="w-4 h-4" />}
            {isVideoLoading ? 'Generating...' : 'Showcase Video'}
          </button>
          <div className="h-6 w-px bg-border-dark mx-2" />
          <div className="relative mr-4 hidden md:block">
            <input 
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExplainTopic()}
              placeholder="Explain any concept..."
              className="bg-item-dark border border-border-dark rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-brand-gold text-text-primary pr-10"
            />
            <button 
              onClick={handleExplainTopic}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-gold hover:scale-110 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
          {[
            { id: 'dna', label: 'DNA', icon: Activity },
            { id: 'plant', label: 'Plant Cell', icon: Database },
            { id: 'bacteria', label: 'Bacteria', icon: MousePointer2 },
            { id: 'krebs', label: 'Krebs Cycle', icon: RefreshCw },
            { id: 'photosynthesis', label: 'Photosynthesis', icon: Sun },
            { id: 'atom', label: 'Atom', icon: Box },
            { id: 'math', label: 'Math', icon: Info },
            { id: 'explain', label: 'AI Explainer', icon: MessageSquare },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveModel(m.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                activeModel === m.id ? 'bg-brand-gold text-bg-dark shadow-lg shadow-brand-gold/20' : 'bg-item-dark text-text-secondary hover:bg-border-dark'
              }`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <color attach="background" args={['#0A0B0E']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#C5A267" />
          <spotLight position={[-10, 10, -10]} intensity={0.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <group>
             {activeModel === 'dna' && <DNA wireframe={wireframe} />}
             {activeModel === 'atom' && <BohrAtom wireframe={wireframe} />}
             {activeModel === 'math' && <MathVisual wireframe={wireframe} />}
             {activeModel === 'plant' && <PlantCell wireframe={wireframe} />}
             {activeModel === 'bacteria' && <BacteriaCell wireframe={wireframe} />}
             {activeModel === 'krebs' && <KrebsCycle wireframe={wireframe} />}
             {activeModel === 'photosynthesis' && <Photosynthesis wireframe={wireframe} />}
             {activeModel === 'explain' && topicResult && <TopicText topic={topicResult.topic} />}
          </group>

          <OrbitControls enableDamping />
        </Canvas>

        {/* Overlay Info */}
        <div className="absolute bottom-10 left-10 max-w-sm pointer-events-none">
          <AnimatePresence mode="wait">
            {activeModel === 'explain' && topicResult ? (
              <motion.div 
                key="explain-result"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-brand-gold/10 backdrop-blur-xl p-6 rounded-3xl border border-brand-gold/30 pointer-events-auto shadow-2xl overflow-y-auto max-h-[60vh] scrollbar-hide"
              >
                <div className="flex items-center gap-2 mb-3 text-brand-gold uppercase tracking-tighter font-black">
                  <Sparkles className="w-4 h-4" />
                  Spatial Analysis
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-gold mb-3 leading-tight">
                  {topicResult.topic}
                </h3>
                <div className="text-[15px] text-text-primary/90 leading-relaxed space-y-4">
                  {topicResult.explanation.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={activeModel}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card-dark/80 backdrop-blur-md p-6 rounded-2xl border border-border-dark"
              >
                <h3 className="text-xl font-bold text-brand-gold mb-2 uppercase tracking-wider">
                  {activeModel === 'dna' ? 'B-DNA Helix' 
                   : activeModel === 'atom' ? 'Bohr Atomic Model' 
                   : activeModel === 'math' ? 'Parametric Functions' 
                   : activeModel === 'plant' ? 'Plant Cell (Class 11/12)'
                   : activeModel === 'bacteria' ? 'Prokaryotic Cell (Class 11/12)'
                   : activeModel === 'krebs' ? 'Krebs Cycle (Mitochondria)'
                   : activeModel === 'photosynthesis' ? 'Photosynthesis (Thylakoid)'
                   : 'AI Conceptual Space'}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {activeModel === 'dna' 
                    ? 'Visualization of the double helix structure. Each sphere represents a nucleotide base pair connected by a phosphate backbone.' 
                    : activeModel === 'atom' 
                    ? 'A simplified representation of an atom showing electrons orbiting a central nucleus at specific energy levels.' 
                    : activeModel === 'math'
                    ? '3D plotting of mathematical functions. Scroll to rotate and zoom into the multidimensional data space.'
                    : activeModel === 'plant'
                    ? 'A typical plant cell featuring a rigid cell wall, large central vacuole, and green chloroplasts for photosynthesis.'
                    : activeModel === 'bacteria'
                    ? 'Prokaryotic structure showing the capsule, circular DNA (nucleoid), and a rotating flagellum for movement.'
                    : activeModel === 'krebs'
                    ? 'The Citric Acid Cycle. Follow the transformation of carbon molecules as energy is harvested as NADH, FADH2, and ATP.'
                    : activeModel === 'photosynthesis'
                    ? 'The light-dependent reactions. Watch photons hit the photosystems, triggering an electron flow to generate energy.'
                    : 'Search for any scientific concept in the top bar to generate a 3D structural explanation here.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Video Preview Modal */}
        <AnimatePresence>
          {generatedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[110] bg-bg-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-10"
            >
              <div className="max-w-4xl w-full space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Video className="w-6 h-6 text-brand-gold" />
                    <h3 className="text-2xl font-serif font-bold text-brand-gold">AI Generation Complete</h3>
                  </div>
                  <button 
                    onClick={() => setGeneratedVideo(null)}
                    className="p-2 hover:bg-item-dark rounded-full transition-colors text-text-secondary"
                  >
                    <ChevronLeft className="w-6 h-6 rotate-90" />
                  </button>
                </div>

                <div className="aspect-video relative bg-card-dark rounded-3xl overflow-hidden border border-brand-gold/20 shadow-2xl group">
                  {/* In a real integrated environment, this would be a <video> tag */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform cursor-pointer">
                      <Play className="w-8 h-8 text-bg-dark fill-current" />
                    </div>
                    <p className="text-text-secondary font-mono text-[10px] uppercase tracking-[0.3em]">Cinematic Rendering Ready</p>
                    <img 
                      src={generatedVideo} 
                      alt="Video preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-item-dark/50 p-6 rounded-2xl border border-border-dark">
                  <div>
                    <p className="text-brand-gold font-bold">Showcase Video Generated</p>
                    <p className="text-text-secondary text-sm">Experience the spatial structure with cinematic camera paths.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-brand-gold text-bg-dark px-6 py-2 rounded-xl font-bold hover:scale-105 transition-transform">
                    <ExternalLink className="w-4 h-4" />
                    Download Video
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isExplaining && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-dark/20 backdrop-blur-sm">
             <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-brand-gold font-bold animate-pulse tracking-widest text-xs">RECONSTRUCTING SPATIAL DATA...</p>
             </div>
          </div>
        )}
        
        <div className="absolute top-10 right-10 flex flex-col gap-4 text-brand-gold opacity-50">
           <div className="flex items-center gap-2 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
              LIVE SIMULATION ENABLED
           </div>
        </div>
      </div>
    </div>
  );
}
