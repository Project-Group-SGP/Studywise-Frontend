import {
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    if (fileType.startsWith("image/")) return <Image className="w-6 h-6" />;
    if (fileType.startsWith("video/")) return <Film className="w-6 h-6" />;
    if (fileType.startsWith("audio/")) return <Music className="w-6 h-6" />;
    if (fileType.includes("pdf")) return <FileText className="w-6 h-6" />;
    if (fileType.includes("zip") || fileType.includes("rar"))
      return <Archive className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const renderPreview = () => {
    if (file.fileType.startsWith("image/")) {
      return (
        <div className="relative group">
          <img
            src={file.thumbnailUrl || file.url}
            alt={file.name}
            className="max-h-48 rounded-lg object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="ghost" className="text-white">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      );
    }

    if (file.fileType.startsWith("video/")) {
      return (
        <video controls className="max-h-48 rounded-lg">
          <source src={file.url} type={file.fileType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (file.fileType.startsWith("audio/")) {
      return (
        <Card className="p-3 flex items-center gap-3">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            <audio controls className="w-full mt-2">
              <source src={file.url} type={file.fileType} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        </Card>
      );
    }

    return (
      <Card className="p-3">
        <div className="flex items-center gap-3">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.name}</p>
            {file.caption && <p className="text-sm italic">{file.caption}</p>}
            <p className="text-sm text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <a
              href={file.url}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </Card>
    );
  };

  return renderPreview();
};

export default FileMessage;
