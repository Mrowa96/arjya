import { rm, writeFile } from 'fs/promises';
import path from 'path';
import { generateApi } from 'swagger-typescript-api';

const swaggerSchemaUrl = new URL('/docs/json', 'http://127.0.0.1:3000');
const swaggerSchemaFilePath = path.join(process.cwd(), './api-schema.json');
const apiClientDirPath = path.join(process.cwd(), './src/_generated');
const apiClientFileName = 'Api.ts';
let swaggerSchema: string;

console.log(`Generating Api client with types from ${swaggerSchemaUrl}...`);

try {
  const swaggerSchemaResponse = await fetch(swaggerSchemaUrl);

  swaggerSchema = await swaggerSchemaResponse.text();
} catch (error) {
  throw new Error(
    `Cannot fetch or/and parse Swagger schema. Please make sure url: "${swaggerSchemaUrl}" is correct and server is working as expected.`,
    { cause: error },
  );
}

try {
  await writeFile(swaggerSchemaFilePath, swaggerSchema, { encoding: 'utf-8' });
} catch (error) {
  throw new Error(`Cannot save Swagger schema to json file: "${swaggerSchemaFilePath}"`, {
    cause: error,
  });
}

try {
  await generateApi({
    input: swaggerSchemaFilePath,
    output: apiClientDirPath,
    fileName: apiClientFileName,
    typePrefix: 'Api',
    silent: true,
    generateClient: true,
    extractResponseBody: true,
    sortTypes: true,
  });
} catch (error) {
  throw new Error(`Cannot generate Api client based on Swagger schema file.`, {
    cause: error,
  });
}

try {
  await rm(swaggerSchemaFilePath);
} catch (error) {
  throw new Error(
    `Cannot remove Swagger schema json file: "${swaggerSchemaFilePath}", but client should be generated.`,
    {
      cause: error,
    },
  );
}

console.log(
  `Api client with types have been saved to ${path.join(apiClientDirPath, apiClientFileName)}`,
);
