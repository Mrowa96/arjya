import * as v from 'valibot';

const envSchema = v.pipe(
  v.object({
    NODE_ENV: v.picklist(['production', 'development']),
    APP_HOSTNAME: v.string(),
    APP_PORT: v.string(),
    APP_PUBLIC_URL: v.pipe(v.string(), v.url()),
  }),
  v.transform((input) => {
    return {
      ...input,
      APP_PORT: Number.parseInt(input.APP_PORT),
    };
  }),
);

type Env = v.InferOutput<typeof envSchema>;

let parsedEnv: Env | undefined;

export function getEnv<T extends keyof Env>(name: T): Env[T] {
  if (!parsedEnv) {
    parsedEnv = v.parse(envSchema, process.env);
  }

  return parsedEnv[name];
}
