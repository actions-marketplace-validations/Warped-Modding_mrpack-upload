import { fetch } from 'ofetch';
import { readFile } from 'fs';
import { join } from 'path';

import { getInput, error } from '@actions/core';
import { bold, green } from 'kleur/colors';

const success = (a: string) => {
  console.log(bold(green('✔')) + ' ' + a);
};

(async () => {
  const inputs = {
    NAME: getInput('name', { required: true }),
    VERSION_NUMBER: getInput('version-number', { required: true }),
    PROJECT_ID: getInput('project-id', { required: true }),
    PACK_FILENAME: getInput('pack-filename', { required: true }),
    GAME_VERSIONS: getInput('game-versions', { required: true }),
    LOADERS: getInput('loaders', { required: true }),
    MODRINTH_TOKEN: getInput('modrinth-token', { required: true }),
  };

  var file

  readFile(inputs.PACK_FILENAME, (err, data) => {
    if (err) throw err;
    file = data;
    console.log(data);
  })

  const form = new URLSearchParams();

  const data = {
    name: inputs.NAME,
    version_number: inputs.VERSION_NUMBER,
    game_versions: inputs.GAME_VERSIONS.split(','),
    version_type: 'release',
    loaders: inputs.LOADERS.split(','),
    featured: false,
    project_id: inputs.PROJECT_ID,
    file_parts: [inputs.PACK_FILENAME],
    dependencies: [],
  };
  form.append('data', JSON.stringify(data));
  form.append(inputs.PACK_FILENAME, file);

  const res = await fetch('https://api.modrinth.com/v2/version', {
    method: 'POST',
    body: form,
    headers: {
      Authorization: inputs.MODRINTH_TOKEN,
    },
  });

  if (!res.ok) {
    error(await res.text());
  }

  success('Uploaded to Modrinth!');
})().catch((e) => {
  error(e);
  process.exit(1);
});
