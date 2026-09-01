import env from '#start/env'
import { defineConfig, services } from '@adonisjs/drive'
import type { InferDriveDisks } from '@adonisjs/drive/types'
import type { S3ClientConfig } from '@aws-sdk/client-s3'

/**
 * Armazenamento de arquivos: um bucket S3-compatível, o mesmo em todo ambiente
 * (RNF-20). MinIO em dev e nos testes, e em produção o que o ambiente apontar.
 *
 * Um destino só porque o upload é presigned multipart, e multipart é API do S3
 * - o driver `fs` não a tem. Um disco local em dev exercitaria um caminho de
 * código que produção não usa, que é justamente o que RNF-20 quer evitar.
 *
 * As credenciais vêm de `STORAGE_*`, e não de um prefixo por fornecedor: o que
 * o código depende é do protocolo. R2, S3, Spaces, Linode e MinIO trocam de
 * lugar mudando `STORAGE_ENDPOINT`.
 */
export const bucket = env.get('STORAGE_BUCKET') ?? ''

/**
 * A conexão com o bucket, exportada porque tem **dois** consumidores: o
 * FlyDrive aqui embaixo, e o `MultipartService`, que fala com o SDK da AWS
 * direto - o FlyDrive não expõe multipart (`CreateMultipartUpload` e companhia).
 *
 * Uma constante e não duas leituras de `env`: dois lugares lendo as mesmas
 * variáveis é onde uma delas é esquecida no dia em que a conexão muda.
 */
export const clientConfig: S3ClientConfig = {
  credentials: {
    accessKeyId: env.get('STORAGE_KEY') ?? '',
    secretAccessKey: env.get('STORAGE_SECRET') ?? '',
  },
  region: 'auto',
  endpoint: env.get('STORAGE_ENDPOINT'),
  forcePathStyle: env.get('STORAGE_FORCE_PATH_STYLE') ?? false,

  // O padrão do SDK é `WHEN_SUPPORTED`, e ele quebra URL assinada: no presign
  // não há corpo, então o checksum que vai para a query é o de **zero bytes**
  // (`x-amz-checksum-crc32=AAAAAA==`). O navegador manda o arquivo de verdade,
  // o bucket confere contra aquele valor e recusa o `PUT`. Com `WHEN_REQUIRED`
  // o checksum só entra onde a operação o exige, e nenhuma das nossas exige.
  requestChecksumCalculation: 'WHEN_REQUIRED',
}

/**
 * O domínio público por onde o navegador busca o arquivo.
 *
 * Não é o mesmo endereço de `STORAGE_ENDPOINT`. Aquele é o endpoint da API S3,
 * e ele exige requisição assinada: sem `cdnUrl`, o FlyDrive monta a URL pública
 * como `endpoint/bucket/chave`, e no R2 isso responde 401 dentro de um `<img>`.
 * Em MinIO passa porque o bucket de desenvolvimento é aberto para leitura, o que
 * esconde o problema até o primeiro deploy.
 *
 * A barra final é garantida porque o FlyDrive resolve a chave como URL relativa
 * (`new URL(key, cdnUrl)`): sem ela, um domínio com caminho perde o último
 * segmento - `https://cdn.exemplo/arquivos` + `foto.webp` viraria
 * `https://cdn.exemplo/foto.webp`.
 */
function cdnUrl() {
  const configured = env.get('STORAGE_CDN_URL')

  if (!configured) return undefined
  if (configured.endsWith('/')) return configured

  return `${configured}/`
}

const driveConfig = defineConfig({
  default: 'r2',

  services: {
    r2: services.s3({ ...clientConfig, bucket, visibility: 'public', cdnUrl: cdnUrl() }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
