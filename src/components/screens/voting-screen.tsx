"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Heart, ThumbsUp, Sparkles, Check } from "lucide-react"
import type { Screen } from "@/src/app/page"

interface VotingScreenProps {
  onNavigate: (screen: Screen) => void
}

// Texto final fragmentado em palavras/trechos clicáveis
const textFragments = [
  { id: 1, text: "Olha,", votes: 0, selected: false },
  { id: 2, text: "eu acho que", votes: 2, selected: true },
  { id: 3, text: "NÃO AGUENTO MAIS", votes: 5, selected: true },
  { id: 4, text: "essa coisa de", votes: 0, selected: false },
  { id: 5, text: "TRABALHAR ATÉ", votes: 3, selected: true },
  { id: 6, text: "tarde demais", votes: 1, selected: false },
  { id: 7, text: "PQ O CHEFE", votes: 4, selected: true },
  { id: 8, text: "não entende que", votes: 0, selected: false },
  { id: 9, text: "A GENTE TEM VIDA!!!", votes: 7, selected: true },
]

export function VotingScreen({ onNavigate }: VotingScreenProps) {
  const [fragments, setFragments] = useState(textFragments)
  const [totalVotes, setTotalVotes] = useState(
    textFragments.reduce((acc, f) => acc + f.votes, 0)
  )

  const handleVote = (id: number) => {
    setFragments(prev => 
      prev.map(f => {
        if (f.id === id) {
          const newVotes = f.votes + 1
          return { ...f, votes: newVotes, selected: true }
        }
        return f
      })
    )
    setTotalVotes(prev => prev + 1)
  }

  const getFragmentStyle = (fragment: typeof textFragments[0]) => {
    if (fragment.votes >= 5) return "bg-[#f7e018] text-[#1a0a2e] border-[#f7e018]"
    if (fragment.votes >= 3) return "bg-[#ff3c78] text-white border-[#ff3c78]"
    if (fragment.selected) return "bg-[#00d4ff] text-[#1a0a2e] border-[#00d4ff]"
    return "bg-[#3d2a5f] text-white border-[#5a3d8a]"
  }

  return (
    <div className="min-h-screen bg-[#1a0a2e] flex flex-col">
      {/* Header */}
      <div className="p-4 bg-[#2d1b4e] border-b-4 border-black">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center gap-3"
        >
          <Star className="w-8 h-8 text-[#f7e018]" />
          <h1 className="font-sans text-3xl text-[#f7e018] text-outline">
            HORA DE VOTAR!
          </h1>
          <Star className="w-8 h-8 text-[#f7e018]" />
        </motion.div>
        <p className="text-center text-[#b8a5d1] font-sans mt-2">
          Toque nas palavras mais engraçadas!
        </p>
      </div>

      {/* Área do texto */}
      <div className="flex-1 p-4 overflow-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#2d1b4e] rounded-2xl neo-brutal p-4"
        >
          {/* Título do texto */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-dashed border-[#5a3d8a]">
            <Sparkles className="w-5 h-5 text-[#00d4ff]" />
            <span className="font-sans text-lg text-[#00d4ff]">TEXTO FINAL:</span>
          </div>

          {/* Fragmentos clicáveis */}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {fragments.map((fragment, index) => (
                <motion.button
                  key={fragment.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, rotate: Math.random() > 0.5 ? 3 : -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleVote(fragment.id)}
                  className={`
                    relative px-3 py-2 rounded-xl border-3 font-sans text-lg
                    transition-all duration-200
                    ${getFragmentStyle(fragment)}
                    ${fragment.votes > 0 ? 'neo-brutal-sm' : 'border-2'}
                  `}
                  style={{
                    transform: fragment.selected 
                      ? `rotate(${Math.random() * 4 - 2}deg)` 
                      : undefined,
                    boxShadow: fragment.votes >= 5 
                      ? '0 0 15px #f7e018' 
                      : fragment.votes >= 3 
                        ? '0 0 10px #ff3c78' 
                        : undefined
                  }}
                >
                  {fragment.text}
                  
                  {/* Badge de votos */}
                  {fragment.votes > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-[#39ff14] text-[#1a0a2e] rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-black"
                    >
                      {fragment.votes}
                    </motion.span>
                  )}

                  {/* Estrela para favoritos */}
                  {fragment.votes >= 5 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute -top-3 -left-3"
                    >
                      <Star className="w-5 h-5 text-[#f7e018] fill-[#f7e018]" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Legenda */}
          <div className="mt-6 pt-4 border-t-2 border-dashed border-[#5a3d8a]">
            <p className="text-[#b8a5d1] font-sans text-sm mb-3">Legenda:</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#f7e018]" />
                <span className="text-xs text-[#b8a5d1] font-sans">5+ votos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#ff3c78]" />
                <span className="text-xs text-[#b8a5d1] font-sans">3-4 votos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-[#00d4ff]" />
                <span className="text-xs text-[#b8a5d1] font-sans">Selecionado</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer com contador de votos */}
      <div className="p-4">
        {/* Contador flutuante */}
        <motion.div
          animate={{ 
            y: [0, -5, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-gradient-to-r from-[#ff3c78] via-[#f7e018] to-[#00d4ff] p-1 rounded-2xl mb-4"
        >
          <div className="bg-[#2d1b4e] rounded-xl px-6 py-3 flex items-center justify-center gap-3">
            <Heart className="w-6 h-6 text-[#ff3c78] fill-[#ff3c78]" />
            <span className="font-sans text-2xl text-white">
              [ {totalVotes} votos no total ]
            </span>
            <ThumbsUp className="w-6 h-6 text-[#f7e018]" />
          </div>
        </motion.div>

        {/* Botão de confirmar */}
        <motion.button
          onClick={() => onNavigate("results")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#39ff14] rounded-2xl neo-brutal py-4 px-6 flex items-center justify-center gap-3"
        >
          <Check className="w-8 h-8 text-[#1a0a2e]" strokeWidth={3} />
          <span className="font-sans text-2xl text-[#1a0a2e]">
            CONFIRMAR VOTOS
          </span>
        </motion.button>
      </div>
    </div>
  )
}
