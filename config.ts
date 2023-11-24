import { JSONSchemaType, envSchema } from 'env-schema'

interface Env {
  ENV_NAME: string
  PROJECT_ID: string
  PROJECT_NUMBER: string
  TF_STATE_BUCKET: string
}

const schema: JSONSchemaType<Env> = {
  type: 'object',
  required: ['ENV_NAME', 'PROJECT_ID', 'PROJECT_NUMBER', 'TF_STATE_BUCKET'],
  properties: {
    ENV_NAME: {
      type: 'string',
    },
    PROJECT_ID: {
      type: 'string',
    },
    PROJECT_NUMBER: {
      type: 'string',
    },
    TF_STATE_BUCKET: {
      type: 'string',
    },
  },
}

const config = envSchema({
  schema,
  dotenv: {
    path: `.env.${process.env.NODE_ENV}`,
  },
})

export default config
