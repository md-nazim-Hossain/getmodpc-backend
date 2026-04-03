import cron from "node-cron";
import { ScrappingService } from "../services/scrapping.service";

export class PlayStoreUpdateJob {
  private readonly scrappingService = new ScrappingService();

  public start() {
    return cron.schedule("*/10 * * * *", async () => {
      console.log("PlayStoreUpdateJob tick at", new Date().toISOString());
      try {
        await this.scrappingService.checkAllPlayStoreApps();
      } catch (error) {
        console.error("❌ PlayStoreUpdateJob error:", error);
      }
    });
  }
}
