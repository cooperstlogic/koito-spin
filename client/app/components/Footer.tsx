import { ExternalLinkIcon } from "lucide-react";
import pkg from "../../package.json";
import { isFork, siteTitle, sourceUrl, upstreamUrl } from "~/branding";

export default function Footer() {
  const version = import.meta.env.VITE_KOITO_VERSION || pkg.version;
  return (
    <div className="mx-auto py-10 pt-20 color-fg-tertiary text-sm">
      <ul className="flex flex-col items-center justify-around">
        <li>
          {isFork ? (
            <>
              {siteTitle} · a fork of{" "}
              <a href={upstreamUrl} target="_blank" className="link-underline">
                Koito
              </a>{" "}
              {version}
            </>
          ) : (
            <>Koito {version}</>
          )}
        </li>
        <li>
          <a href={sourceUrl} target="_blank" className="link-underline">
            View the source on GitHub{" "}
            <ExternalLinkIcon className="inline mb-1" size={14} />
          </a>
        </li>
      </ul>
    </div>
  );
}
