import {
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
  Download,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type FileMessageProps = {
  type: "file";
  id: string;
  name: string;
  url: string;
  fileType: string;
  size: number;
  userId: string;
  groupId: string;
  caption?: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  metadata?: Record<string, any>;
};

const FileMessage = ({ file }: { file: FileMessageProps }) => {
  const getFileIcon = () => {
    const fileType = file.fileType;
    if (fileType.startsWith("image/")) return <Image className="w-5 h-5" />;
    if (fileType.startsWith("video/")) return <Film className="w-5 h-5" />;
    if (fileType.startsWith("audio/")) return <Music className="w-5 h-5" />;
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5" />;
    if (fileType.includes("zip") || fileType.includes("rar"))
      return <Archive className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (file.fileType.startsWith("image/")) {
    return (
      <div className="max-w-xs">
        <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm">
          <img
            src={file.previewUrl || file.thumbnailUrl || file.url}
            alt={file.name}
            className="w-full object-cover"
          />
          {file.caption && (
            <p className="text-sm p-2 text-gray-700 dark:text-gray-300">
              {file.caption}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (file.fileType.startsWith("video/")) {
    return (
      <div className="max-w-xs">
        <div className="relative rounded-xl overflow-hidden bg-white dark:bg-zinc-800 shadow-sm">
          {file.previewUrl || file.thumbnailUrl ? (
            <>
              <img
                src={file.previewUrl || file.thumbnailUrl}
                alt={file.name}
                className="w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-black/50 p-3">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            </>
          ) : (
            <video controls className="w-full rounded-lg">
              <source src={file.url} type={file.fileType} />
            </video>
          )}
          <div className="p-2 text-xs text-gray-500 dark:text-gray-400">
            {file.metadata?.duration && formatDuration(file.metadata.duration)}
          </div>
        </div>
      </div>
    );
  }

  if (file.fileType.startsWith("audio/")) {
    return (
      <div className="max-w-sm rounded-xl p-3 bg-white dark:bg-zinc-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2 text-blue-600 dark:text-blue-400">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {file.name}
            </p>
            <audio controls className="w-full mt-2 h-8">
              <source src={file.url} type={file.fileType} />
            </audio>
          </div>
        </div>
      </div>
    );
  }

  // Default file message (documents, PDFs, archives, etc.)
  return (
    <div className="max-w-sm rounded-xl bg-white dark:bg-zinc-800 shadow-sm">
      {file.previewUrl && file.fileType.includes("pdf") && (
        <div className="h-32 overflow-hidden rounded-t-xl">
          <img
            src={file.previewUrl}
            alt={`Preview of ${file.name}`}
            className="w-full object-cover object-top"
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-2 text-blue-600 dark:text-blue-400">
            {getFileIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatFileSize(file.size)}
              {file.metadata?.pageCount &&
                ` • ${file.metadata.pageCount} pages`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700"
            asChild
          >
            <a
              href={file.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2"
            >
              <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </a>
          </Button>
        </div>
        {file.caption && (
          <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
            {file.caption}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileMessage;
