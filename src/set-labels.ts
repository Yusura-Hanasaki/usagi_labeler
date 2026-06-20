import { type ComAtprotoLabelDefs } from '@atproto/api';
import { type LoginCredentials, setLabelerLabelDefinitions } from '@skyware/labeler/scripts';
import { readFileSync } from 'fs';
import { join } from 'path';

import { BSKY_IDENTIFIER, BSKY_PASSWORD } from './config.js';
import { LABELS } from './constants.js';
import logger from './logger.js';

const loginCredentials: LoginCredentials = {
  identifier: BSKY_IDENTIFIER,
  password: BSKY_PASSWORD,
};

const labelDefinitions: ComAtprotoLabelDefs.LabelValueDefinition[] = [];

for (const label of LABELS) {
  // 💡 修正ポイント：assetsフォルダ内の「識別子.png」を自動で読み込む仕組み
  let avatarBuffer: Buffer | undefined;
  try {
    const imagePath = join(process.cwd(), 'assets', `${label.identifier}.png`);
    avatarBuffer = readFileSync(imagePath);
  } catch (e) {
    logger.warn(`画像が見つかりません: assets/${label.identifier}.png (スキップします)`);
  }

  const labelValueDefinition: ComAtprotoLabelDefs.LabelValueDefinition = {
    identifier: label.identifier,
    severity: 'inform',
    blurs: 'none',
    defaultSetting: 'warn',
    adultOnly: false,
    locales: label.locales,
    // 💡 修正ポイント：画像データが存在すれば、ここにセットする
    avatar: avatarBuffer, 
  };

  labelDefinitions.push(labelValueDefinition);
}

try {
  await setLabelerLabelDefinitions(loginCredentials, labelDefinitions);
  logger.info('Label definitions and images set successfully!');
} catch (error) {
  logger.error(`Error setting label definitions: ${error}`);
}