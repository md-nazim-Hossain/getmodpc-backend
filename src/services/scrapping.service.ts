import axios from "axios";
import gPlay from "google-play-scraper";
import {
  EnumLiteApkType,
  ICheckAppVersionResponse,
  IGenericResponse,
  ILiteApksAppsAndGames,
  IPaginationOptions,
} from "../types";
import ApiError from "../utils/ApiError";
import httpStatusCodes from "http-status-codes";
import * as cheerio from "cheerio";
import { calculatePagination } from "../utils/pagination";
import { format } from "date-fns";
import { scrapeLiteApkApp } from "../scrapers/liteapks.scraper";
import { AppDataSource } from "../config/db";
import { App } from "../models/app.model";

export class ScrappingService {
  private readonly appRepository = AppDataSource.getRepository(App);
  async getPlayStoreAppByUrl(playStoreUrl: string): Promise<any> {
    try {
      const appId = new URL(playStoreUrl).searchParams.get("id");

      if (!appId) {
        throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid URL");
      }

      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      };

      const [app, html] = await Promise.all([
        gPlay.app({
          appId,
          lang: "en",
        }),
        axios.get(playStoreUrl, { headers }),
      ]);

      const $ = cheerio.load(html.data);

      const bodyText = $("body").text();

      const size =
        bodyText.match(/\d+(\.\d+)?\s?(MB|GB)/i)?.[0] || "Varies with device";

      const updated =
        bodyText.match(/Updated on\s*(\w+\s\d+,\s\d+)/i)?.[1] || null;

      return {
        ...app,
        size,
        updated_text:
          updated ??
          (app.updated ? format(new Date(app.updated), "MMM d, yyyy") : null),
        source: "play_store",
      };
    } catch (error) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, "Invalid URL");
    }
  }

  async getPlayStoreAppsByAppName(
    searchText: string,
    paginationOptions: IPaginationOptions,
  ): Promise<IGenericResponse<any[]>> {
    const { limit, page, skip } = calculatePagination(paginationOptions);
    const apps = await gPlay.search({
      term: searchText?.toLocaleLowerCase(),
      lang: "en",
      price: "all",
      fullDetail: false,
      num: 250,
    });
    const startIndex = skip;
    const endIndex = startIndex + limit;
    const paginatedApps = apps.slice(startIndex, endIndex);
    return {
      data: paginatedApps,
      meta: {
        page,
        limit,
        total: apps.length,
        hasNextPage: endIndex < apps.length,
        hasPreviousPage: startIndex > 0,
        totalPages: Math.ceil(apps.length / limit),
      },
    };
  }

  async checkUpdate(
    id: string,
    appId: string,
    currentVersion: string,
  ): Promise<ICheckAppVersionResponse> {
    const app = await gPlay.app({ appId });
    await this.appRepository.update(
      { id },
      { last_version_checked_at: new Date() },
    );
    return {
      update_available: app.version !== currentVersion,
      current_version: currentVersion,
      new_version: app.version,
      last_checked: new Date(),
    };
  }

  //=========================== LiteApks APPS =========================//
  async getLiteApkAppByUrl(url: string): Promise<any> {
    return await scrapeLiteApkApp(url);
  }

  async getAllLiteApkLatestAppsAndGames(
    type: EnumLiteApkType,
    page = 1,
  ): Promise<ILiteApksAppsAndGames[]> {
    const baseUrl = `https://liteapks.com/${type}/page/${page}`;

    const { data } = await axios.get(baseUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(data);
    const apps: ILiteApksAppsAndGames[] = [];

    $("#games-container #games-grid article").each((_, element) => {
      const el = $(element);
      const title = el.find(".game-info h3").text().trim();
      const ratingsRaw = el.find(".text-star").text().trim();
      const scoreText = ratingsRaw.split(" ")[1];
      const shortMode = el.find(".text-gray").text().trim();
      const link = $(element).find("> a").attr("href") || "";
      let icon = el.find(".game-thumb img").attr("src") || "";

      if (title && link) {
        apps.push({
          title,
          link,
          icon,
          scoreText,
          shortMode,
        });
      }
    });

    return apps;
  }
}
