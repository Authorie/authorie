// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env.mjs"));
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withAxiom } from "next-axiom";

/** @type {import("next").NextConfig} */
const config = {
  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: `${process.env.R2_OBJECT_URL}`,
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/messages",
        destination: "/404",
        permanent: true,
      },
      {
        source: "/notifications",
        destination: "/404",
        permanent: true,
      },
    ];
  },
};
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(
  withAxiom(config)
);
