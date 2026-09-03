import { test } from '@japa/runner'
import PixService, { crc16 } from '#services/pix.service'

/**
 * O BR Code do Pix.
 *
 * Testado porque a falha dele é silenciosa do lado errado: um código malformado
 * não quebra nada aqui - ele é aceito pelo servidor, desenhado no QR, e só é
 * recusado no aplicativo do banco de quem tenta pagar. Ninguém fica sabendo,
 * exceto a pessoa que desistiu de se matricular.
 */
test.group('pix > br code', () => {
  const pix = new PixService()

  test('o CRC é o CCITT-FALSE, e não outro dos dezesseis', ({ assert }) => {
    // O vetor de verificação canônico do CRC-16/CCITT-FALSE. É o único teste
    // aqui cujo valor esperado não saiu do nosso código - os outros provariam
    // apenas que a implementação concorda com ela mesma.
    //
    // Existem mais de dez variantes de CRC-16 com o mesmo polinômio e sementes
    // ou reflexões diferentes, e todas produzem quatro dígitos plausíveis. Este
    // vetor é o que separa a que o Bacen especificou das outras.
    assert.equal(crc16('123456789'), '29B1')
  })

  test('o código tem os campos obrigatórios do padrão', ({ assert }) => {
    const code = pix.payload()

    assert.isTrue(code.startsWith('000201'), 'payload format indicator')
    assert.include(code, 'BR.GOV.BCB.PIX')
    assert.include(code, '5303986', 'moeda em real')
    assert.include(code, '5802BR', 'país')
  })

  test('o dígito final confere o código inteiro', ({ assert }) => {
    const code = pix.payload({ amountInCents: 5000, txid: 'ABC123' })

    const semDigito = code.slice(0, -4)
    const digito = code.slice(-4)

    // O CRC cobre o próprio `6304`: calcular antes de acrescentá-lo é o erro
    // clássico, e dá um dígito que nenhum banco aceita.
    assert.equal(crc16(semDigito), digito)
    assert.isTrue(semDigito.endsWith('6304'))
  })

  test('o valor entra em reais, com duas casas', ({ assert }) => {
    const code = pix.payload({ amountInCents: 5000 })

    // `54` é o identificador do valor, `05` o tamanho de "50.00".
    assert.include(code, '540550.00')
  })

  test('sem valor o campo não aparece', ({ assert }) => {
    const code = pix.payload()

    // `5400` não é a mesma coisa que ausência, e parte dos aplicativos recusa
    // um valor zerado.
    assert.notInclude(code, '5400')
  })

  test('o protocolo vai no txid, para o extrato dizer de quem foi o Pix', ({ assert }) => {
    const code = pix.payload({ txid: 'MAIYU-2026-0007' })

    assert.include(code, 'MAIYU-2026-0007')
  })

  test('nome e cidade saem sem acento e em maiúsculas', ({ assert }) => {
    const code = pix.payload()

    // O manual restringe os dois ao ASCII imprimível. Um acento é aceito por
    // parte dos aplicativos e recusado por outra, que é o pior dos mundos.
    assert.notMatch(code, /[À-ÿ]/)

    // Truncado em 15 pelo teto do manual: "Benjamin Constant" tem 17. Cortar é
    // o comportamento certo - o que o padrão recusa é o campo maior que o
    // limite, e um código recusado não é pago.
    assert.include(code, '6015BENJAMIN CONSTA')
  })

  test('o tamanho declarado de cada campo é o tamanho real', ({ assert }) => {
    const code = pix.payload({ amountInCents: 15000, txid: 'X'.repeat(40) })

    // Percorre o payload como o aplicativo do banco percorre: lê o id, lê o
    // tamanho, pula o valor. Se algum tamanho estiver errado, a leitura
    // desalinha e não chega ao fim exato da string.
    let cursor = 0

    while (cursor < code.length) {
      const size = Number(code.slice(cursor + 2, cursor + 4))

      assert.isNotNaN(size, `tamanho ilegível em ${cursor}`)

      cursor += 4 + size
    }

    assert.equal(cursor, code.length, 'a leitura terminou fora do fim do código')
  })

  test('o txid longo demais é truncado, e não estoura o campo', ({ assert }) => {
    const code = pix.payload({ txid: 'X'.repeat(40) })

    // O teto do manual é 25. Escrever 40 faria o campo declarar um tamanho que
    // o padrão não aceita.
    assert.include(code, `0525${'X'.repeat(25)}`)
  })
})
