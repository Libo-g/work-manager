import { Badge } from '@/components/ui/badge';

interface TagBadgeProps {
  name: string;
  color: string;
}

export function TagBadge({ name, color }: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      style={{ borderColor: color, color: color }}
      className="text-xs"
    >
      {name}
    </Badge>
  );
}
