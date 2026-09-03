import limiter from '@adonisjs/limiter/services/main'

/**
 * Os tetos de tentativa, por rota.
 *
 * Cada um responde a um abuso diferente, e é por isso que não há um número só:
 * o que protege a porta de entrada sufocaria o formulário de matrícula, e o que
 * cabe numa matrícula deixaria a porta aberta.
 *
 * A chave é o IP. Não é perfeito - vários candidatos atrás do mesmo NAT contam
 * junto -, mas quem se inscreve não tem sessão, e não há outra coisa a contar.
 * Por isso os limites são generosos o bastante para uma escola inteira num
 * laboratório de informática: barram o laço de shell, não a turma.
 */

/**
 * A porta do painel. Cinco tentativas por minuto é folgado para quem erra a
 * senha e apertado para quem a adivinha.
 */
export const signInThrottle = limiter.define('signIn', function () {
  return limiter.allowRequests(5).every('1 minute')
})

/**
 * O convite. O token tem 64 caracteres sorteados, então o limite não existe
 * para impedir adivinhação - existe para que sondar a rota não seja de graça.
 */
export const inviteThrottle = limiter.define('invite', function () {
  return limiter.allowRequests(10).every('1 minute')
})

/**
 * A matrícula, que é escrita anônima: sem teto, um laço de shell enche o banco
 * e a turma "lota" sem ninguém ter se inscrito. Dez por hora cobre a família
 * que matricula os três filhos e erra o formulário no meio.
 */
export const enrollmentThrottle = limiter.define('enrollment', function () {
  return limiter.allowRequests(10).every('1 hour')
})

/**
 * O upload do comprovante. Mais alto que a matrícula porque um arquivo grande
 * vira várias partes, e cada parte é uma requisição - o teto conta requisição,
 * não arquivo.
 */
export const uploadThrottle = limiter.define('upload', function () {
  return limiter.allowRequests(60).every('1 hour')
})
