import type { Icon, IconWeight } from 'phosphor-react-native';
import { View, type StyleProp, type ViewStyle } from 'react-native';

// Um require por ícone: o bundle leva só os ícones usados e o tsc não checa o fonte .tsx da biblioteca.
/* eslint-disable @typescript-eslint/no-require-imports */
const ArchiveIcon: Icon = require('phosphor-react-native/src/icons/Archive').ArchiveIcon;
const ArmchairIcon: Icon = require('phosphor-react-native/src/icons/Armchair').ArmchairIcon;
const ArrowRightIcon: Icon = require('phosphor-react-native/src/icons/ArrowRight').ArrowRightIcon;
const ArrowsClockwiseIcon: Icon = require('phosphor-react-native/src/icons/ArrowsClockwise').ArrowsClockwiseIcon;
const ArrowsOutIcon: Icon = require('phosphor-react-native/src/icons/ArrowsOut').ArrowsOutIcon;
const BabyIcon: Icon = require('phosphor-react-native/src/icons/Baby').BabyIcon;
const BellIcon: Icon = require('phosphor-react-native/src/icons/Bell').BellIcon;
const BookmarkSimpleIcon: Icon = require('phosphor-react-native/src/icons/BookmarkSimple').BookmarkSimpleIcon;
const BriefcaseIcon: Icon = require('phosphor-react-native/src/icons/Briefcase').BriefcaseIcon;
const BroomIcon: Icon = require('phosphor-react-native/src/icons/Broom').BroomIcon;
const BugIcon: Icon = require('phosphor-react-native/src/icons/Bug').BugIcon;
const CarIcon: Icon = require('phosphor-react-native/src/icons/Car').CarIcon;
const CalendarBlankIcon: Icon = require('phosphor-react-native/src/icons/CalendarBlank').CalendarBlankIcon;
const CameraIcon: Icon = require('phosphor-react-native/src/icons/Camera').CameraIcon;
const CaretDownIcon: Icon = require('phosphor-react-native/src/icons/CaretDown').CaretDownIcon;
const CaretRightIcon: Icon = require('phosphor-react-native/src/icons/CaretRight').CaretRightIcon;
const CaretUpIcon: Icon = require('phosphor-react-native/src/icons/CaretUp').CaretUpIcon;
const ChartBarIcon: Icon = require('phosphor-react-native/src/icons/ChartBar').ChartBarIcon;
const ChatCircleIcon: Icon = require('phosphor-react-native/src/icons/ChatCircle').ChatCircleIcon;
const CheckIcon: Icon = require('phosphor-react-native/src/icons/Check').CheckIcon;
const CheckCircleIcon: Icon = require('phosphor-react-native/src/icons/CheckCircle').CheckCircleIcon;
const ChefHatIcon: Icon = require('phosphor-react-native/src/icons/ChefHat').ChefHatIcon;
const CircleNotchIcon: Icon = require('phosphor-react-native/src/icons/CircleNotch').CircleNotchIcon;
const ClipboardTextIcon: Icon = require('phosphor-react-native/src/icons/ClipboardText').ClipboardTextIcon;
const ClockIcon: Icon = require('phosphor-react-native/src/icons/Clock').ClockIcon;
const CoffeeIcon: Icon = require('phosphor-react-native/src/icons/Coffee').CoffeeIcon;
const CompassIcon: Icon = require('phosphor-react-native/src/icons/Compass').CompassIcon;
const CreditCardIcon: Icon = require('phosphor-react-native/src/icons/CreditCard').CreditCardIcon;
const CrosshairIcon: Icon = require('phosphor-react-native/src/icons/Crosshair').CrosshairIcon;
const DotsThreeVerticalIcon: Icon = require('phosphor-react-native/src/icons/DotsThreeVertical').DotsThreeVerticalIcon;
const DropIcon: Icon = require('phosphor-react-native/src/icons/Drop').DropIcon;
const ExportIcon: Icon = require('phosphor-react-native/src/icons/Export').ExportIcon;
const FileIcon: Icon = require('phosphor-react-native/src/icons/File').FileIcon;
const FileTextIcon: Icon = require('phosphor-react-native/src/icons/FileText').FileTextIcon;
const FlagIcon: Icon = require('phosphor-react-native/src/icons/Flag').FlagIcon;
const FrameCornersIcon: Icon = require('phosphor-react-native/src/icons/FrameCorners').FrameCornersIcon;
const GearSixIcon: Icon = require('phosphor-react-native/src/icons/GearSix').GearSixIcon;
const HammerIcon: Icon = require('phosphor-react-native/src/icons/Hammer').HammerIcon;
const HandHeartIcon: Icon = require('phosphor-react-native/src/icons/HandHeart').HandHeartIcon;
const HeartIcon: Icon = require('phosphor-react-native/src/icons/Heart').HeartIcon;
const HeartbeatIcon: Icon = require('phosphor-react-native/src/icons/Heartbeat').HeartbeatIcon;
const HouseIcon: Icon = require('phosphor-react-native/src/icons/House').HouseIcon;
const HouseLineIcon: Icon = require('phosphor-react-native/src/icons/HouseLine').HouseLineIcon;
const ImageIcon: Icon = require('phosphor-react-native/src/icons/Image').ImageIcon;
const InfoIcon: Icon = require('phosphor-react-native/src/icons/Info').InfoIcon;
const KeyIcon: Icon = require('phosphor-react-native/src/icons/Key').KeyIcon;
const LayoutIcon: Icon = require('phosphor-react-native/src/icons/Layout').LayoutIcon;
const LightningIcon: Icon = require('phosphor-react-native/src/icons/Lightning').LightningIcon;
const ListIcon: Icon = require('phosphor-react-native/src/icons/List').ListIcon;
const LockIcon: Icon = require('phosphor-react-native/src/icons/Lock').LockIcon;
const MagnifyingGlassIcon: Icon = require('phosphor-react-native/src/icons/MagnifyingGlass').MagnifyingGlassIcon;
const MapPinIcon: Icon = require('phosphor-react-native/src/icons/MapPin').MapPinIcon;
const MapTrifoldIcon: Icon = require('phosphor-react-native/src/icons/MapTrifold').MapTrifoldIcon;
const MedalIcon: Icon = require('phosphor-react-native/src/icons/Medal').MedalIcon;
const NavigationArrowIcon: Icon = require('phosphor-react-native/src/icons/NavigationArrow').NavigationArrowIcon;
const PackageIcon: Icon = require('phosphor-react-native/src/icons/Package').PackageIcon;
const PaintRollerIcon: Icon = require('phosphor-react-native/src/icons/PaintRoller').PaintRollerIcon;
const PaperPlaneRightIcon: Icon = require('phosphor-react-native/src/icons/PaperPlaneRight').PaperPlaneRightIcon;
const PawPrintIcon: Icon = require('phosphor-react-native/src/icons/PawPrint').PawPrintIcon;
const PencilSimpleIcon: Icon = require('phosphor-react-native/src/icons/PencilSimple').PencilSimpleIcon;
const PencilSimpleLineIcon: Icon = require('phosphor-react-native/src/icons/PencilSimpleLine').PencilSimpleLineIcon;
const PipeIcon: Icon = require('phosphor-react-native/src/icons/Pipe').PipeIcon;
const PlantIcon: Icon = require('phosphor-react-native/src/icons/Plant').PlantIcon;
const PlusIcon: Icon = require('phosphor-react-native/src/icons/Plus').PlusIcon;
const QuestionIcon: Icon = require('phosphor-react-native/src/icons/Question').QuestionIcon;
const RulerIcon: Icon = require('phosphor-react-native/src/icons/Ruler').RulerIcon;
const SecurityCameraIcon: Icon = require('phosphor-react-native/src/icons/SecurityCamera').SecurityCameraIcon;
const ShareNetworkIcon: Icon = require('phosphor-react-native/src/icons/ShareNetwork').ShareNetworkIcon;
const ShieldCheckIcon: Icon = require('phosphor-react-native/src/icons/ShieldCheck').ShieldCheckIcon;
const ShoppingCartIcon: Icon = require('phosphor-react-native/src/icons/ShoppingCart').ShoppingCartIcon;
const SignOutIcon: Icon = require('phosphor-react-native/src/icons/SignOut').SignOutIcon;
const SlidersHorizontalIcon: Icon = require('phosphor-react-native/src/icons/SlidersHorizontal').SlidersHorizontalIcon;
const SmileyIcon: Icon = require('phosphor-react-native/src/icons/Smiley').SmileyIcon;
const SnowflakeIcon: Icon = require('phosphor-react-native/src/icons/Snowflake').SnowflakeIcon;
const SolarPanelIcon: Icon = require('phosphor-react-native/src/icons/SolarPanel').SolarPanelIcon;
const SquareIcon: Icon = require('phosphor-react-native/src/icons/Square').SquareIcon;
const SquaresFourIcon: Icon = require('phosphor-react-native/src/icons/SquaresFour').SquaresFourIcon;
const StackIcon: Icon = require('phosphor-react-native/src/icons/Stack').StackIcon;
const StarIcon: Icon = require('phosphor-react-native/src/icons/Star').StarIcon;
const SunIcon: Icon = require('phosphor-react-native/src/icons/Sun').SunIcon;
const TagIcon: Icon = require('phosphor-react-native/src/icons/Tag').TagIcon;
const TelevisionIcon: Icon = require('phosphor-react-native/src/icons/Television').TelevisionIcon;
const TrashIcon: Icon = require('phosphor-react-native/src/icons/Trash').TrashIcon;
const TrayIcon: Icon = require('phosphor-react-native/src/icons/Tray').TrayIcon;
const TruckIcon: Icon = require('phosphor-react-native/src/icons/Truck').TruckIcon;
const TShirtIcon: Icon = require('phosphor-react-native/src/icons/TShirt').TShirtIcon;
const UmbrellaIcon: Icon = require('phosphor-react-native/src/icons/Umbrella').UmbrellaIcon;
const UserIcon: Icon = require('phosphor-react-native/src/icons/User').UserIcon;
const UsersIcon: Icon = require('phosphor-react-native/src/icons/Users').UsersIcon;
const WallIcon: Icon = require('phosphor-react-native/src/icons/Wall').WallIcon;
const WarningIcon: Icon = require('phosphor-react-native/src/icons/Warning').WarningIcon;
const WarningCircleIcon: Icon = require('phosphor-react-native/src/icons/WarningCircle').WarningCircleIcon;
const WifiSlashIcon: Icon = require('phosphor-react-native/src/icons/WifiSlash').WifiSlashIcon;
const WindIcon: Icon = require('phosphor-react-native/src/icons/Wind').WindIcon;
const WrenchIcon: Icon = require('phosphor-react-native/src/icons/Wrench').WrenchIcon;
const XIcon: Icon = require('phosphor-react-native/src/icons/X').XIcon;

/** Nomes herdados do Feather (para não quebrar telas) + ícones de serviço. */
const icons = {
  activity: HeartbeatIcon, 'alert-circle': WarningCircleIcon, 'alert-octagon': WarningIcon, archive: ArchiveIcon,
  'arrow-right': ArrowRightIcon, award: MedalIcon, 'bar-chart-2': ChartBarIcon, bell: BellIcon, bookmark: BookmarkSimpleIcon,
  box: PackageIcon, briefcase: BriefcaseIcon, calendar: CalendarBlankIcon, camera: CameraIcon, check: CheckIcon,
  'check-circle': CheckCircleIcon, 'chevron-down': CaretDownIcon, 'chevron-right': CaretRightIcon, 'chevron-up': CaretUpIcon,
  clipboard: ClipboardTextIcon, clock: ClockIcon, coffee: CoffeeIcon, compass: CompassIcon, 'credit-card': CreditCardIcon,
  crosshair: CrosshairIcon, 'edit-2': PencilSimpleIcon, 'edit-3': PencilSimpleLineIcon, file: FileIcon, 'file-text': FileTextIcon,
  flag: FlagIcon, grid: SquaresFourIcon, heart: HeartIcon, 'help-circle': QuestionIcon, home: HouseIcon, image: ImageIcon,
  inbox: TrayIcon, info: InfoIcon, key: KeyIcon, layers: StackIcon, layout: LayoutIcon, list: ListIcon, loader: CircleNotchIcon,
  lock: LockIcon, 'log-out': SignOutIcon, map: MapTrifoldIcon, 'map-pin': MapPinIcon, 'maximize-2': ArrowsOutIcon,
  'message-circle': ChatCircleIcon, 'more-vertical': DotsThreeVerticalIcon, navigation: NavigationArrowIcon, plus: PlusIcon,
  'refresh-cw': ArrowsClockwiseIcon, search: MagnifyingGlassIcon, send: PaperPlaneRightIcon, settings: GearSixIcon,
  share: ExportIcon, 'share-2': ShareNetworkIcon, shield: ShieldCheckIcon, 'shopping-cart': ShoppingCartIcon,
  sliders: SlidersHorizontalIcon, smile: SmileyIcon, square: SquareIcon, star: StarIcon, sun: SunIcon, tag: TagIcon,
  tool: WrenchIcon, 'trash-2': TrashIcon, truck: TruckIcon, tv: TelevisionIcon, umbrella: UmbrellaIcon, user: UserIcon,
  users: UsersIcon, droplet: DropIcon, 'wifi-off': WifiSlashIcon, wind: WindIcon, x: XIcon, zap: LightningIcon,
  // Serviços
  baby: BabyIcon, car: CarIcon, paw: PawPrintIcon, 'hand-heart': HandHeartIcon, snowflake: SnowflakeIcon, bug: BugIcon,
  'solar-panel': SolarPanelIcon, pipe: PipeIcon, drop: DropIcon, broom: BroomIcon, shirt: TShirtIcon, 'chef-hat': ChefHatIcon,
  'paint-roller': PaintRollerIcon, plant: PlantIcon, armchair: ArmchairIcon, hammer: HammerIcon,
  'security-camera': SecurityCameraIcon, wall: WallIcon, frame: FrameCornersIcon, roof: HouseLineIcon, ruler: RulerIcon,
} satisfies Record<string, Icon>;

export type IconName = keyof typeof icons;

export interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function AppIcon({ name, size = 24, color, weight = 'regular', style, accessibilityLabel }: AppIconProps) {
  const Component = icons[name] ?? WrenchIcon;
  const icon = <Component size={size} color={color} weight={weight} style={accessibilityLabel ? undefined : style} />;
  if (!accessibilityLabel) return icon;
  return <View style={style} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>{icon}</View>;
}
