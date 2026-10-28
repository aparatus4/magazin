import {
  Boxes,
  CakeSlice,
  Car,
  Cpu,
  Gamepad2,
  Gem,
  HeartPulse,
  Home,
  Landmark,
  Layers3,
  Leaf,
  MessageSquareQuote,
  PackageCheck,
  PenTool,
  Printer,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import type { IconName } from '../data/catalog'

const iconMap: Record<IconName, LucideIcon> = {
  portrait: UserRound,
  home: Home,
  art: Landmark,
  jewellery: Gem,
  tech: Cpu,
  toys: Gamepad2,
  food: CakeSlice,
  prototypes: Boxes,
  health: HeartPulse,
  automotive: Car,
  scan: ScanLine,
  model: PenTool,
  print: Printer,
  finish: Sparkles,
  batch: PackageCheck,
  review: MessageSquareQuote,
  layers: Layers3,
  sparkle: Sparkles,
  truck: Truck,
  leaf: Leaf,
  shield: ShieldCheck,
  star: Star,
}

interface IconProps {
  name: IconName
  size?: number
  strokeWidth?: number
  className?: string
}

export function CategoryIcon({ name, size = 20, strokeWidth = 1.6, className }: IconProps) {
  const Component = iconMap[name]
  return <Component size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />
}
