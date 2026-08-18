import { execFile } from 'node:child_process';
import { unlink } from 'node:fs/promises';
import { Logger } from '@nestjs/common';
import { promisify } from 'node:util';

const executer = promisify(execFile);

const logger = new Logger('AudioTranscoder');

/**
 * La reconnaissance vocale de l'appareil rend un `wav` sur Android et un `caf`
 * sur iOS, tous deux en PCM non compresse. Le `caf` ne se lit pas sur Android,
 * et le poids brut penalise la reception : on ramene tout au m4a.
 *
 * En cas d'echec, le fichier d'origine est conserve : mieux vaut un vocal
 * lisible sur une seule plateforme qu'un message perdu.
 */
export async function transcodeToM4a(
  cheminSource: string,
): Promise<{ chemin: string; transcode: boolean }> {
  if (cheminSource.toLowerCase().endsWith('.m4a')) {
    return { chemin: cheminSource, transcode: false };
  }

  const cible = `${cheminSource.replace(/\.[^.]+$/, '')}.m4a`;

  try {
    await executer(
      'ffmpeg',
      ['-nostdin', '-y', '-i', cheminSource, '-c:a', 'aac', '-b:a', '64k', cible],
      { timeout: 60_000 },
    );

    await unlink(cheminSource).catch(() => undefined);

    return { chemin: cible, transcode: true };
  } catch (error) {
    logger.warn(
      `Conversion audio impossible (${cheminSource}) : le fichier d'origine est conserve.`,
    );
    logger.debug(error instanceof Error ? error.message : String(error));

    return { chemin: cheminSource, transcode: false };
  }
}
