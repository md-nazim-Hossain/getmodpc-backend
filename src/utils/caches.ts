import { AppDataSource } from "../config/db";
import { Setting } from "../models/setting.model";

type CacheItem = {
  value: Setting | null;
  expire: number;
};

const settingCache = new Map<string, CacheItem>();

setInterval(
  () => {
    const now = Date.now();
    console.log("called");
    for (const [key, item] of settingCache) {
      if (item.expire <= now) {
        settingCache.delete(key);
      }
    }
  },
  10 * 60 * 1000,
);

export async function getSettingByKey(
  key: string,
): Promise<Record<string, any> | null> {
  const cached = settingCache.get(key);

  if (cached && cached.expire > Date.now()) {
    return cached.value?.value || null;
  }

  const settingRepository = AppDataSource.getRepository(Setting);

  const setting = await settingRepository.findOne({
    where: { key },
  });

  settingCache.set(key, {
    value: setting,
    expire: Date.now() + 30 * 60 * 1000, // 30 minutes
  });

  return setting?.value || null;
}

export function invalidateSettingCache(key: string) {
  settingCache.delete(key);
}

export function invalidateAllSettingCache() {
  settingCache.clear();
}
