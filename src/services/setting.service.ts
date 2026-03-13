import { AppDataSource } from "../config/db";
import { Setting } from "../models/setting.model";
import httpStatusCodes from "http-status-codes";
import ApiError from "../utils/ApiError";
import { invalidateSettingCache } from "../utils/caches";
export class SettingService {
  private readonly settingRepo = AppDataSource.getRepository(Setting);

  async getAllSettings(): Promise<Setting[]> {
    const settings = await this.settingRepo.find();
    return settings;
  }

  async upsertSetting(key: string, value: any) {
    const existingSetting = await this.settingRepo.findOne({ where: { key } });
    if (existingSetting) {
      existingSetting.value = value;
      await this.settingRepo.save(existingSetting);
    } else {
      const newSetting = new Setting();
      newSetting.key = key;
      newSetting.value = value;
      await this.settingRepo.save(newSetting);
    }
    invalidateSettingCache(key);
  }

  async getSetting(key: string): Promise<Setting> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) {
      throw new ApiError(
        httpStatusCodes.NOT_FOUND,
        "Setting not found for key",
      );
    }
    return setting;
  }

  async deleteSetting(key: string) {
    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) {
      throw new ApiError(
        httpStatusCodes.NOT_FOUND,
        "Setting not found for key",
      );
    }
    await this.settingRepo.remove(setting);
  }
}
