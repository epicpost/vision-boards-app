import { TemplateCard } from "./TemplateCard";
import { getTemplateMedia, type PostTemplate } from "@/lib/post-templates";

function templateToPin(template: PostTemplate, index: number) {
  const media = getTemplateMedia(template);

  return {
    id: template.id,
    src: media.url,
    mediaType: media.type,
    width: media.width,
    height: media.height,
    fallbackHeight: 460 + (index % 4) * 40,
    title: template.title,
    isSaved: template.is_saved,
  };
}

function PinSkeleton({ index }: { index: number }) {
  return (
    <div className="mb-3 break-inside-avoid">
      <div
        className="w-full animate-pulse rounded-[16px] bg-secondary"
        style={{ aspectRatio: `1 / ${(460 + (index % 4) * 40) / 250}` }}
      />
      <div className="mx-2 mt-2 h-4 w-3/4 animate-pulse rounded bg-secondary" />
    </div>
  );
}

export function TemplateGrid({
  templates,
  isLoading,
  isFetchingMore,
  isError,
  onRetry,
  search,
}: {
  templates: PostTemplate[];
  isLoading: boolean;
  isFetchingMore?: boolean;
  isError: boolean;
  onRetry: () => void;
  search?: string;
}) {
  if (isError) {
    return (
      <div className="px-3 md:px-6 pb-10">
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-foreground">Templates did not load</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            The public feed is unavailable right now.
          </p>
          <button
            onClick={onRetry}
            className="mt-5 h-11 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:brightness-90"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!isLoading && templates.length === 0) {
    return (
      <div className="px-3 md:px-6 pb-10">
        <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
          <h2 className="text-lg font-bold text-foreground">No templates found</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            {search ? `Nothing matched "${search}".` : "The public feed is empty."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 md:px-6 pb-10">
      <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6 gap-3 [column-fill:_balance]">
        {isLoading ? (
          Array.from({ length: 12 }, (_, index) => <PinSkeleton key={index} index={index} />)
        ) : (
          <>
            {templates.map((template, index) => (
              <TemplateCard key={template.id} pin={templateToPin(template, index)} />
            ))}
            {isFetchingMore
              ? Array.from({ length: 8 }, (_, index) => (
                  <PinSkeleton key={`next-page-${index}`} index={templates.length + index} />
                ))
              : null}
          </>
        )}
      </div>
    </div>
  );
}
