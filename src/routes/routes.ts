import { Router } from "express";
import categoryRoutes from "./category.route";
import authRoute from "./admin-auth.route";
import commentRoutes from "./comment.route";
import adminRoutes from "./admin.route";
import pageRoutes from "./page.route";
import mediaRoutes from "./media.route";
import developerRoutes from "./developer.route";
import tagRoutes from "./tag.route";
import testimonialRoutes from "./testimonial.route";

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
  {
    path: "/comments",
    route: commentRoutes,
  },
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
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export const routes = router;
