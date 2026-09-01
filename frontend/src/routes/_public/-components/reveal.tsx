'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'motion/react'

/**
 * Aparecer ao entrar na tela.
 *
 * A única animação da landing, e ela tem uma razão: as seções contam uma
 * sequência (o que é, quanto custa, quando começa, quem ensina), e revelar cada
 * uma na hora em que ela chega dá ritmo a essa leitura. Não há glow pulsante,
 * não há parallax, não há marquee - movimento sem motivo custa bateria e quadro
 * num celular que já está numa conexão ruim.
 *
 * `whileInView` do Motion e não `ScrollTrigger`: não há nada a fixar nem a
 * raspar aqui, e o GSAP inteiro entraria no bundle para fazer o que um
 * IntersectionObserver faz.
 *
 * `useReducedMotion` desliga tudo: para quem tem sensibilidade vestibular isto
 * não é enfeite, é sintoma. O `styles.css` já tem a regra global; esta é a que
 * impede o estado inicial `opacity: 0` de deixar a seção invisível quando a
 * animação é anulada.
 */
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number
  className?: string
  children: React.ReactNode
}): React.JSX.Element {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
