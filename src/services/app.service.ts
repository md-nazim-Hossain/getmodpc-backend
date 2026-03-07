import gplay from "google-play-scraper";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";

export class AppService {
  async getAppDataByUrl(playStoreUrl: string): Promise<any> {
    try {
      const url = new URL(playStoreUrl);
      const packageId = url.searchParams.get("id");

      if (!packageId) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid URL");
      }

      const app = await gplay.app({
        appId: packageId,
        lang: "en",
        country: "us",
      });

      return app;
    } catch (error) {
      throw new ApiError(
        httpStatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to fetch app data",
      );
    }
  }
}
