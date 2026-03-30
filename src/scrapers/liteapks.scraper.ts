import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeLiteApkApp(url: string) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  const $ = cheerio.load(data);

  const title = ($("h1").first().text().trim() || "").split("v")[0].trim();

  const descriptionHtml = $(".entry-content").html() || null;

  const description = $(".entry-content").text().trim();

  const icon = $(".app-info-icon img").attr("src") || null;

  const shortModeRaw = $(".app-info-section .sub-info p").text().trim();

  const shortMode = shortModeRaw.includes(":")
    ? shortModeRaw.split(":")[1].trim()
    : shortModeRaw || null;

  let summary: string = "";

  const recentChanges = $(".short-desc p em").text().trim() || "";

  const texts: string[] = [];

  $(".entry-content p, li, td").each((_, el) => {
    const t = $(el).text().trim();
    if (t) texts.push(t);
  });

  let version: string | null = null;
  let size: string | null = null;
  let scoreText: string | null = null;
  let ratings: number = 0;

  $(".app-stats .app-stat").each((_, el) => {
    const label = $(el).find(".label").text().trim().toLowerCase();
    const value = $(el).find(".value").text().trim();

    if (!value) return;

    if (/version/.test(label)) {
      version = value;
    } else if (/size/.test(label)) {
      size = value;
    } else if (/ratings|score/.test(label)) {
      scoreText = value;
      ratings = +(label.split(" ")[0] || 0);
    }
  });

  let genre: string | null = null;
  let genreId: string | null = null;
  let installs: string | null = null;
  let categories: Array<{
    name: string;
    id: string;
  }> = [];
  let updated_text: string | null = null;
  const headerImage = $(".single-hero .hero-bg img").attr("src") || null;

  $(".app-info-bar .info-bar-scroll .info-bar-item").each((_, el) => {
    const label = $(el).find(".info-bar-label").text().trim().toLowerCase();
    const value = $(el).find(".info-bar-value").text().trim();
    const sub = $(el).find(".info-bar-sub").text().trim();
    const subLinkText = $(el).find(".info-bar-sub a").text().trim();
    if (!value && !subLinkText && !sub) return;
    if (/genre|category/.test(label)) {
      genre = subLinkText;
      genreId = subLinkText.toLocaleUpperCase();
      categories.push({
        name: subLinkText,
        id: subLinkText.toLocaleUpperCase(),
      });
    } else if (/reached/.test(label)) {
      installs = value;
    } else if (/updated/.test(label)) {
      updated_text = `${value}, ${sub}`;
    }
  });

  const developer =
    $('a.developer, a[href*="developer"], a[rel="tag"]')
      .first()
      .text()
      .trim() || null;
  const reviews = +(
    ($(".rating-overview .count").text().trim() || "").split(" ")[0] ?? 0
  );

  texts.forEach((t) => {
    if (!summary && /unlocked|premium|mod/i.test(t)) {
      summary = t;
    }
  });

  const screenshots: string[] = [];
  $("#screenshotScroll img").each((_, el) => {
    const src = $(el).attr("src");
    if (src) screenshots.push(src);
  });

  return {
    title,
    icon,
    headerImage,
    developer,
    version,
    size,
    ratings: +ratings,
    recentChanges,
    summary,
    shortMode,
    description,
    descriptionHtml,
    screenshots,
    scoreText,
    installs,
    genre,
    genreId,
    categories,
    reviews,
    url,
    updated_text,
    source: "lite_apks",
  };
}
