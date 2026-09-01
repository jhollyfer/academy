import { test } from '@japa/runner'
import { authenticateAsOwner, body, OWNER, resetDatabase } from '../helpers.ts'

test.group('conta > leitura', (group) => {
  group.each.setup(() => resetDatabase())

  test('devolve a conta da sessão, sem a senha', async ({ client, assert }) => {
    const session = await authenticateAsOwner(client)

    const response = await client.get('/account/profile').cookies(session)

    response.assertStatus(200)

    const profile = body(response)

    assert.equal(profile.email, OWNER.email)
    assert.equal(profile.role, 'OWNER')
    assert.notProperty(profile, 'password')
  })

  test('recusa sem sessão com 401', async ({ client }) => {
    const response = await client.get('/account/profile')

    response.assertStatus(401)
  })
})
