import { Router } from "express";
import categoryRoutes from "./category.route";
import authRoute from "./auth.route";
import commentRoutes from "./comment.route";
import adminRoutes from "./admin.route";
import pageRoutes from "./page.route";
import mediaRoutes from "./media.route";
import developerRoutes from "./developer.route";
import tagRoutes from "./tag.route";
import testimonialRoutes from "./testimonial.route";
import faqRoutes from "./faq.route";
import userRequestRoutes from "./user_request.route";
import reportReasonRoutes from "./report_reason.route";
import reportRoutes from "./report.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/admins",
    route: adminRoutes,
  },
  {
    path: "/categories",
    route: categoryRoutes,
  },
  {
    path: "/developers",
    route: developerRoutes,
  },
  {
    path: "/tags",
    route: tagRoutes,
  },
  // {
  //   path: "/comments",
  //   route: commentRoutes,
  // },
  {
    path: "/pages",
    route: pageRoutes,
  },
  {
    path: "/medias",
    route: mediaRoutes,
  },
  {
    path: "/testimonials",
    route: testimonialRoutes,
  },
  {
    path: "/faqs",
    route: faqRoutes,
  },
  {
    path: "/user-app-requests",
    route: userRequestRoutes,
  },
  {
    path: "/report-reasons",
    route: reportReasonRoutes,
  },
  {
    path: "/reports",
    route: reportRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export const routes = router;
