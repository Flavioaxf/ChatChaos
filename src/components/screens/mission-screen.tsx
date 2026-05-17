"use client"

import { motion } from "framer-motion"
import { Stamp, EyeOff, AlertTriangle, Angry } from "lucide-react"
import type { Screen } from "@/src/app/page"

interface MissionScreenProps {
  onNavigate: (screen: Screen) => void
}

export function MissionScreen({ onNavigate }: MissionScreenProps) {
  return (
    <div className="min-h-screen bg-[#1a0a2e]/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#1a0a2e]/90 to-[#1a0a2e] pointer-events-none" />
      
      {/* Elementos de fundo secretos */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="absolute top-20 left-10 text-6xl"
      >
        🤫
      </motion.div>
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute bottom-40 right-10 text-5xl"
      >
        🕵️
      </motion.div>
      
      {/* Aviso de missão */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 mb-6 flex items-center gap-2"
      >
        <EyeOff className="w-6 h-6 text-[#ff3c78]" />
        <span className="font-sans text-xl text-[#ff3c78]">SOMENTE VOCÊ PODE VER</span>
        <EyeOff className="w-6 h-6 text-[#ff3c78]" />
      </motion.div>

      {/* Card da missão */}
      <motion.div
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="z-10 w-full max-w-sm"
      >
        <div className="relative">
          {/* Fundo do card estilo papel amassado */}
          <div 
            className="bg-gradient-to-br from-[#f5e6d3] via-[#e8d5c4] to-[#d4c4b0] rounded-lg p-6 transform rotate-1"
            style={{
              boxShadow: "8px 8px 0 rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.1)",
              border: "4px solid #8b7355"
            }}
          >
            {/* Cabeçalho confidencial */}
            <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b-2 border-dashed border-[#8b7355]">
              <AlertTriangle className="w-5 h-5 text-[#c0392b]" />
              <span className="font-mono text-sm text-[#c0392b] tracking-widest">
                CONFIDENCIAL
              </span>
              <AlertTriangle className="w-5 h-5 text-[#c0392b]" />
            </div>

            {/* Título da missão */}
            <motion.h2
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-center font-sans text-3xl text-[#2c1810] mb-4"
            >
              SUA MISSÃO:
            </motion.h2>

            {/* Conteúdo da missão */}
            <div className="bg-[#fff8dc] rounded-lg p-4 border-2 border-[#8b7355] mb-4 tilt-left">
              <div className="flex items-center justify-center mb-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Angry className="w-16 h-16 text-[#e74c3c]" />
                </motion.div>
              </div>
              <p className="text-center font-sans text-2xl text-[#2c1810] leading-tight">
                Escreva como se estivesse{" "}
                <span className="text-[#e74c3c] underline decoration-wavy">IRRITADO</span>
              </p>
            </div>

            {/* Dica */}
            <p className="text-center text-sm text-[#8b7355] font-mono mb-4">
              Não deixe ninguém descobrir! 🤐
            </p>

            {/* Decoração de canto */}
            <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#c0392b] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">TOP</span>
            </div>
            <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-[#c0392b] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">SEC</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Botão de confirmação estilo carimbo */}
      <motion.button
        onClick={() => onNavigate("game")}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1, rotate: -5 }}
        whileTap={{ scale: 0.9 }}
        className="z-10 mt-8"
      >
        <div 
          className="relative bg-[#c0392b] rounded-xl px-10 py-4 transform -rotate-3"
          style={{
            boxShadow: "6px 6px 0 rgba(0,0,0,0.4)",
            border: "4px solid #922b21"
          }}
        >
          <div className="flex items-center gap-3">
            <Stamp className="w-8 h-8 text-white" />
            <span className="font-sans text-3xl text-white tracking-wider">
              ENTENDIDO!
            </span>
          </div>
          
          {/* Efeito de carimbo */}
          <div className="absolute inset-0 rounded-xl border-4 border-dashed border-white/30 pointer-events-none" />
        </div>
      </motion.button>

      {/* Aviso adicional */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="z-10 mt-6 text-[#5a3d8a] font-sans text-sm text-center"
      >
        Toque para continuar e não contar pra ninguém! 🤫
      </motion.p>
    </div>
  )
}
