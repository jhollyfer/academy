import type { Socket } from 'socket.io'
import contentService from '#services/content_service'
import type { IQuizDataQuestion } from '#core/entity.core'
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  type Room,
  type Student,
  type ClientInfo,
  type ClientMessage,
  type RankingEntry,
} from '#services/quiz/quiz_types'

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function shuffleQuestionOptions(q: IQuizDataQuestion): IQuizDataQuestion {
  const indices = q.opcoes.map((_, i) => i)
  const shuffledIndices = shuffleArray(indices)
  return {
    ...q,
    opcoes: shuffledIndices.map((i) => q.opcoes[i]),
    correta: shuffledIndices.indexOf(q.correta),
  }
}

const MAX_ROOMS = 10
const ROOM_CLEANUP_MS = 5 * 60 * 1000

const rooms = new Map<string, Room>()
const clients = new Map<string, { ws: Socket; info: ClientInfo }>()

function send(ws: Socket, data: unknown) {
  if (ws.connected) {
    ws.emit('message', data)
  }
}

function getWsById(wsId: string): Socket | undefined {
  return clients.get(wsId)?.ws
}

function broadcastToRoom(roomCode: string, data: unknown, excludeWsId?: string) {
  for (const [wsId, client] of clients) {
    if (client.info.roomCode === roomCode && wsId !== excludeWsId) {
      send(client.ws, data)
    }
  }
}

function getStudentList(room: Room) {
  return Array.from(room.students.values()).map((s) => ({
    id: s.id,
    name: s.name,
  }))
}

function generateRoomCode(): string {
  let code: string
  do {
    code = String(Math.floor(1000 + Math.random() * 9000))
  } while (rooms.has(code))
  return code
}

function handleCreateRoom(ws: Socket, courseSlug: string, moduleName?: string, lessonSlug?: string) {
  if (rooms.size >= MAX_ROOMS) {
    return send(ws, {
      type: SERVER_EVENTS.ERROR,
      message: 'Limite de salas atingido. Tente novamente mais tarde.',
    })
  }

  let questions: import('#core/entity.core').IQuizDataQuestion[] | null

  if (lessonSlug) {
    questions = contentService.getLessonQuizQuestions(courseSlug, lessonSlug)
  } else if (moduleName) {
    questions = contentService.getModuleQuizQuestions(courseSlug, moduleName)
  } else {
    questions = contentService.getQuizQuestions(courseSlug, true)
  }

  if (!questions || questions.length === 0) {
    let message = 'Nenhuma pergunta encontrada para este curso.'
    if (lessonSlug) {
      message = 'Nenhuma pergunta encontrada para esta aula.'
    } else if (moduleName) {
      message = 'Nenhuma pergunta encontrada para este módulo.'
    }
    return send(ws, { type: SERVER_EVENTS.ERROR, message })
  }

  questions = questions.map(shuffleQuestionOptions)

  const roomCode = generateRoomCode()
  const room: Room = {
    code: roomCode,
    courseSlug,
    moduleName,
    lessonSlug,
    teacherWsId: ws.id,
    students: new Map(),
    questions,
    currentQuestionIndex: -1,
    answers: new Map(),
    phase: 'lobby',
    questionDurationSeconds: 60,
  }

  rooms.set(roomCode, room)
  clients.set(ws.id, { ws, info: { roomCode, role: 'teacher' } })

  send(ws, {
    type: SERVER_EVENTS.ROOM_CREATED,
    roomCode,
    questionCount: questions.length,
  })
}

function handleJoinRoom(ws: Socket, roomCode: string, name: string) {
  const room = rooms.get(roomCode)
  if (!room) {
    return send(ws, { type: SERVER_EVENTS.ERROR, message: 'Sala não encontrada.' })
  }

  if (room.phase !== 'lobby') {
    return send(ws, { type: SERVER_EVENTS.ERROR, message: 'O quiz já começou.' })
  }

  const trimmed = name.trim()
  if (trimmed.split(/\s+/).length < 2) {
    return send(ws, {
      type: SERVER_EVENTS.ERROR,
      message: 'Digite seu nome completo (nome e sobrenome).',
    })
  }

  if (trimmed.length > 50) {
    return send(ws, { type: SERVER_EVENTS.ERROR, message: 'Nome muito longo (máx 50).' })
  }

  const nameLower = trimmed.toLowerCase()
  for (const s of room.students.values()) {
    if (s.name.toLowerCase() === nameLower) {
      return send(ws, {
        type: SERVER_EVENTS.ERROR,
        message: 'Já existe um aluno com esse nome na sala.',
      })
    }
  }

  const studentId = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const student: Student = { id: studentId, name: trimmed, wsId: ws.id }
  room.students.set(studentId, student)
  room.answers.set(studentId, new Map())
  clients.set(ws.id, { ws, info: { roomCode, role: 'student', studentId } })

  const studentList = getStudentList(room)

  send(ws, {
    type: SERVER_EVENTS.JOINED,
    studentId,
    students: studentList,
  })

  broadcastToRoom(roomCode, { type: SERVER_EVENTS.STUDENT_JOINED, students: studentList }, ws.id)
}

const ALLOWED_DURATIONS = [60, 180, 300]

function handleStartQuiz(ws: Socket, questionDurationSeconds?: number) {
  const client = clients.get(ws.id)
  if (!client || client.info.role !== 'teacher') return

  const room = rooms.get(client.info.roomCode)
  if (!room || room.phase !== 'lobby') return

  if (room.students.size === 0) {
    return send(ws, { type: SERVER_EVENTS.ERROR, message: 'Nenhum aluno na sala.' })
  }

  room.questionDurationSeconds =
    questionDurationSeconds && ALLOWED_DURATIONS.includes(questionDurationSeconds)
      ? questionDurationSeconds
      : 60

  room.phase = 'question'
  room.currentQuestionIndex = 0
  sendQuestion(room)
}

function sendQuestion(room: Room) {
  const q = room.questions[room.currentQuestionIndex]

  const teacherWs = getWsById(room.teacherWsId)
  if (teacherWs) {
    send(teacherWs, {
      type: SERVER_EVENTS.QUESTION,
      questionIndex: room.currentQuestionIndex,
      totalQuestions: room.questions.length,
      questionDurationSeconds: room.questionDurationSeconds,
      question: {
        lessonTitulo: q.lessonTitulo,
        lessonDescricao: q.lessonDescricao,
        lessonModulo: q.lessonModulo,
        pergunta: q.pergunta,
        opcoes: q.opcoes,
        correta: q.correta,
      },
    })
  }

  for (const student of room.students.values()) {
    const studentWs = getWsById(student.wsId)
    if (studentWs) {
      send(studentWs, {
        type: SERVER_EVENTS.QUESTION,
        questionIndex: room.currentQuestionIndex,
        totalQuestions: room.questions.length,
        questionDurationSeconds: room.questionDurationSeconds,
        question: {
          lessonTitulo: q.lessonTitulo,
          lessonDescricao: q.lessonDescricao,
          lessonModulo: q.lessonModulo,
          pergunta: q.pergunta,
          opcoes: q.opcoes,
        },
      })
    }
  }
}

function handleAnswer(ws: Socket, questionIndex: number, selected: number) {
  const client = clients.get(ws.id)
  if (!client || client.info.role !== 'student') return

  const room = rooms.get(client.info.roomCode)
  if (!room || room.phase !== 'question') return
  if (questionIndex !== room.currentQuestionIndex) return

  const q = room.questions[questionIndex]
  if (selected < 0 || selected >= q.opcoes.length) return

  const studentId = client.info.studentId!
  const studentAnswers = room.answers.get(studentId)
  if (!studentAnswers || studentAnswers.has(questionIndex)) return

  studentAnswers.set(questionIndex, selected)

  let answeredCount = 0
  for (const [sid] of room.students) {
    const ans = room.answers.get(sid)
    if (ans && ans.has(questionIndex)) answeredCount++
  }

  const student = room.students.get(studentId)
  let connectedStudents = 0
  for (const s of room.students.values()) {
    if (!s.disconnectedAt) connectedStudents++
  }
  const teacherWs = getWsById(room.teacherWsId)
  if (teacherWs) {
    send(teacherWs, {
      type: SERVER_EVENTS.STUDENT_ANSWERED,
      studentId,
      studentName: student ? student.name : '?',
      answeredCount,
      totalStudents: connectedStudents,
    })
  }
}

function handleReveal(ws: Socket) {
  const client = clients.get(ws.id)
  if (!client || client.info.role !== 'teacher') return

  const room = rooms.get(client.info.roomCode)
  if (!room || room.phase !== 'question') return

  room.phase = 'revealed'
  const qi = room.currentQuestionIndex
  const q = room.questions[qi]

  const results: Record<string, { studentName: string; selected: number; correct: boolean }> = {}
  for (const [sid, student] of room.students) {
    const ans = room.answers.get(sid)
    const selected = ans ? ans.get(qi) : undefined
    results[sid] = {
      studentName: student.name,
      selected: selected !== undefined ? selected : -1,
      correct: selected === q.correta,
    }
  }

  const revealData = {
    type: SERVER_EVENTS.REVEALED,
    questionIndex: qi,
    correctAnswer: q.correta,
    explicacao: q.explicacao,
    explicacaoErrada: q.explicacaoErrada,
    results,
  }

  const teacherWs = getWsById(room.teacherWsId)
  if (teacherWs) send(teacherWs, revealData)

  for (const student of room.students.values()) {
    const studentWs = getWsById(student.wsId)
    if (studentWs) send(studentWs, revealData)
  }
}

function handleNextQuestion(ws: Socket) {
  const client = clients.get(ws.id)
  if (!client || client.info.role !== 'teacher') return

  const room = rooms.get(client.info.roomCode)
  if (!room || room.phase !== 'revealed') return

  const nextIndex = room.currentQuestionIndex + 1
  if (nextIndex >= room.questions.length) {
    room.phase = 'finished'
    const ranking = computeRanking(room)
    const finishData = { type: SERVER_EVENTS.FINISHED, ranking }

    const teacherWs = getWsById(room.teacherWsId)
    if (teacherWs) send(teacherWs, finishData)

    for (const student of room.students.values()) {
      const studentWs = getWsById(student.wsId)
      if (studentWs) send(studentWs, finishData)
    }

    // Auto-cleanup room after 5 minutes
    setTimeout(() => {
      if (rooms.has(room.code)) {
        destroyRoom(room.code)
      }
    }, ROOM_CLEANUP_MS)
    return
  }

  room.currentQuestionIndex = nextIndex
  room.phase = 'question'
  sendQuestion(room)
}

function computeRanking(room: Room): RankingEntry[] {
  const ranking: RankingEntry[] = []
  for (const [sid, student] of room.students) {
    const ans = room.answers.get(sid)
    let correct = 0
    if (ans) {
      for (let i = 0; i < room.questions.length; i++) {
        if (ans.get(i) === room.questions[i].correta) correct++
      }
    }
    ranking.push({
      studentId: sid,
      name: student.name,
      correct,
      total: room.questions.length,
      percentage: Math.round((correct / room.questions.length) * 100),
    })
  }
  return ranking.sort((a, b) => b.correct - a.correct)
}

function destroyRoom(roomCode: string) {
  const room = rooms.get(roomCode)
  if (!room) return

  for (const student of room.students.values()) {
    const studentWs = getWsById(student.wsId)
    if (studentWs) send(studentWs, { type: SERVER_EVENTS.ROOM_CLOSED })
    clients.delete(student.wsId)
  }
  clients.delete(room.teacherWsId)
  rooms.delete(roomCode)
}

const RECONNECT_GRACE_MS = 30_000

function handleRejoinRoom(ws: Socket, roomCode: string, studentId: string) {
  const room = rooms.get(roomCode)
  if (!room) {
    return send(ws, { type: SERVER_EVENTS.ERROR, message: 'Sala não encontrada.' })
  }

  const student = room.students.get(studentId)
  if (!student) {
    return send(ws, { type: SERVER_EVENTS.ERROR, message: 'Aluno não encontrado na sala.' })
  }

  // Cancel old grace period timer
  if (student.graceTimer) {
    clearTimeout(student.graceTimer)
    student.graceTimer = undefined
  }
  student.wsId = ws.id
  student.disconnectedAt = undefined
  clients.set(ws.id, { ws, info: { roomCode, role: 'student', studentId } })

  const studentList = getStudentList(room)
  const currentQ = room.currentQuestionIndex >= 0 ? room.questions[room.currentQuestionIndex] : null

  const rejoinPayload: Record<string, unknown> = {
    type: SERVER_EVENTS.REJOINED,
    studentId,
    students: studentList,
    phase: room.phase,
  }

  if (currentQ) {
    rejoinPayload.questionIndex = room.currentQuestionIndex
    rejoinPayload.totalQuestions = room.questions.length
    rejoinPayload.question = {
      lessonTitulo: currentQ.lessonTitulo,
      lessonDescricao: currentQ.lessonDescricao,
      lessonModulo: currentQ.lessonModulo,
      pergunta: currentQ.pergunta,
      opcoes: currentQ.opcoes,
    }
  }

  send(ws, rejoinPayload)
  broadcastToRoom(roomCode, { type: SERVER_EVENTS.STUDENT_JOINED, students: studentList }, ws.id)
}

function handleDisconnect(ws: Socket) {
  const client = clients.get(ws.id)
  if (!client) return

  const room = rooms.get(client.info.roomCode)
  if (!room) {
    clients.delete(ws.id)
    return
  }

  if (client.info.role === 'teacher') {
    destroyRoom(client.info.roomCode)
  } else if (client.info.role === 'student' && client.info.studentId) {
    const studentId = client.info.studentId
    const roomCode = client.info.roomCode
    const student = room.students.get(studentId)
    if (student) {
      student.disconnectedAt = Date.now()
      if (student.graceTimer) clearTimeout(student.graceTimer)
      student.graceTimer = setTimeout(() => {
        const r = rooms.get(roomCode)
        if (!r) return
        const s = r.students.get(studentId)
        if (s && s.disconnectedAt) {
          r.students.delete(studentId)
          const studentList = getStudentList(r)
          broadcastToRoom(roomCode, { type: SERVER_EVENTS.STUDENT_LEFT, students: studentList })
        }
      }, RECONNECT_GRACE_MS)
    }
    clients.delete(ws.id)
  }
}

export function handleConnection(ws: Socket) {
  ws.on('message', (data: ClientMessage) => {
    switch (data.type) {
      case CLIENT_EVENTS.CREATE_ROOM:
        handleCreateRoom(ws, data.courseSlug, data.moduleName, data.lessonSlug)
        break
      case CLIENT_EVENTS.JOIN_ROOM:
        handleJoinRoom(ws, data.roomCode, data.name || '')
        break
      case CLIENT_EVENTS.REJOIN_ROOM:
        handleRejoinRoom(ws, data.roomCode, data.studentId)
        break
      case CLIENT_EVENTS.START_QUIZ:
        handleStartQuiz(ws, data.questionDurationSeconds)
        break
      case CLIENT_EVENTS.ANSWER:
        handleAnswer(ws, data.questionIndex, data.selected)
        break
      case CLIENT_EVENTS.REVEAL:
        handleReveal(ws)
        break
      case CLIENT_EVENTS.NEXT_QUESTION:
        handleNextQuestion(ws)
        break
    }
  })

  ws.on('disconnect', () => handleDisconnect(ws))
}
