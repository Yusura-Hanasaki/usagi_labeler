import { BskyAgent } from '@atproto/api';
import { BSKY_IDENTIFIER, BSKY_PASSWORD } from './config.js';
import { labelerServer } from './label.js';
import logger from './logger.js';

const agent = new BskyAgent({ service: 'https://bsky.social' });

const ALL_LABELS = ['cocoa', 'chino', 'rize', 'chiya', 'syaro', 'maya', 'megu', 'fuyu', 'elu', 'natsume', 'aoyama', 'mocha'];

async function sync() {
  try {
    await agent.login({ identifier: BSKY_IDENTIFIER, password: BSKY_PASSWORD });
    logger.info('ラベラーアカウントにログインしました。');

    let cursor: string | undefined = undefined;
    let totalSynced = 0;

    // 💡 フォロワーがいなくなるまで、100人ずつ何度もループを繰り返します
    do {
      const followersRes = await agent.getFollowers({
        actor: agent.session!.did,
        limit: 100,      // 1回の上限は100人
        cursor: cursor,  // 💡 次のページを示す目印（最初は空っぽ）
      });

      const followers = followersRes.data.followers;
      cursor = followersRes.data.cursor; // 次のページの目印を更新

      if (followers.length === 0) break;

      for (const follower of followers) {
        const userDid = follower.did;

        // 全キャラのラベルを付与
        for (const labelVal of ALL_LABELS) {
          await labelerServer.createLabel({
            uri: userDid,
            val: labelVal,
          });
        }
        totalSynced++;
      }

      logger.info(`${totalSynced}人目までのバッジ処理が完了...`);

    } while (cursor); // 💡 次のページの目印（cursor）がある限りループを続ける

    logger.info(`【完了】合計 ${totalSynced} 人の登録者全員に、全ラベルの付与が完了しました！`);
  } catch (error) {
    logger.error(`エラーが発生しました: ${error}`);
  }
}

sync();