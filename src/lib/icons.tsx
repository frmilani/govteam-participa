import {
    // Documentos
    FileText, FileCheck, FilePlus, FileSearch, FileX, FileClock, FileSpreadsheet,
    FolderOpen, FolderPlus, FolderCheck, Archive, ClipboardCheck, ClipboardList,
    BookOpen, BookMarked, Notebook, NotebookPen,

    // Finanças
    Receipt, CreditCard, Wallet, Banknote, PiggyBank, DollarSign, Coins,
    TrendingUp, TrendingDown, BarChart3, PieChart, LineChart, Calculator, Percent,
    HandCoins, Landmark, CircleDollarSign,

    // Saúde
    HeartPulse, Heart, HeartHandshake, Activity, Stethoscope, Pill, Syringe,
    Ambulance, Hospital, Cross, Thermometer, Brain, Bone, Eye, Glasses,
    Accessibility, PersonStanding, Baby, Smile, Frown, Bed, Armchair,

    // Educação e Cultura
    GraduationCap, School, Library, PenTool, Pencil, Palette, Paintbrush,
    Music, Music2, Headphones, Camera, Film, Clapperboard, Tv, Radio, Newspaper,
    Theater, Ticket, PartyPopper, Sparkles, BookUser, BookHeart,

    // Urbanismo e Infraestrutura
    Building, Building2, Home, House, Hotel, Factory, Warehouse, Construction,
    HardHat, Ruler, Hammer, Wrench, Shovel, Drill, BrickWall, Fence,
    Lightbulb, PlugZap, Plug, Cable, CircuitBoard, Lamp, LampDesk,

    // Transporte e Trânsito
    Car, CarFront, Truck, Bus, Train, TrainFront, Plane, PlaneTakeoff,
    Ship, Sailboat, Anchor, Bike, Footprints, Navigation, Map, MapPin,
    MapPinned, Compass, Route, Signpost, TrafficCone, CircleParking, Fuel, Gauge,

    // Segurança Pública
    Shield, ShieldCheck, ShieldAlert, ShieldPlus, Lock, Unlock, Key, KeyRound,
    Fingerprint, ScanFace, AlertTriangle, AlertCircle, AlertOctagon, Siren,
    Flame, FireExtinguisher, BadgeCheck, BadgeAlert, UserCheck, UserX, Flashlight,

    // Meio Ambiente
    Leaf, TreePine, TreeDeciduous, Trees, Flower, Flower2, Sprout, Apple,
    Cherry, Grape, Carrot, Wheat, Recycle, Trash2, Droplets, Droplet, Waves,
    Wind, CloudRain, CloudSun, Sun, Moon, Cloud, Snowflake, Umbrella, Rainbow,
    Mountain, MountainSnow, Tent, Palmtree, Fish, Bird, Bug, Rabbit, Turtle,

    // Social e Cidadania
    Users, UsersRound, UserPlus, UserMinus, User, UserCircle, Contact,
    Handshake, HandHeart, Dog, Cat, PawPrint, Briefcase, BriefcaseMedical,
    Scale, Gavel, Vote, Megaphone, MessageSquare, MessagesSquare,

    // Assistência Social e Alimentação
    Gift, ShoppingBasket, Utensils, UtensilsCrossed, CookingPot, Soup, Coffee,
    CupSoda, Milk, Sandwich, Pizza, Croissant, Cake,
    Shirt, Bath, ShowerHead,

    // Comunicação
    Phone, PhoneCall, PhoneIncoming, PhoneOutgoing, Smartphone, Tablet, Laptop,
    Monitor, Mail, MailOpen, MailPlus, MailCheck, Inbox, Send, Globe, Globe2,
    Wifi, WifiOff, Signal, Rss, AtSign, Hash, MessageCircle, Bell, BellRing,

    // Serviços Públicos
    Zap, ZapOff, Power, PowerOff, Battery, BatteryCharging, Sunrise, Sunset,

    // Comércio e Empreendedorismo
    ShoppingCart, ShoppingBag, Store, Package, PackageOpen, PackageCheck,
    PackagePlus, PackageSearch, Boxes, Container, Barcode, ScanBarcode, Tag, Tags,
    BadgePercent, Rocket, Target, Goal, Crosshair, Focus,

    // Status e Informação
    Info, HelpCircle, CheckCircle, CheckCircle2, XCircle, MinusCircle, PlusCircle,
    Clock, Calendar, CalendarDays, CalendarCheck, CalendarPlus, CalendarClock,
    CalendarHeart, CalendarSearch, Timer, TimerOff, Hourglass, History, Undo, Redo,

    // Conquistas e Reconhecimento
    Award, Trophy, Medal, Crown, Star, StarHalf, Flag, ThumbsUp, ThumbsDown,
    Verified, CircleCheck,

    // Tecnologia
    Database, Server, HardDrive, Usb, Bluetooth, QrCode, Scan, ScanLine,
    Printer, Code, Code2, Terminal, Binary,

    // Configurações
    Settings, Settings2, Cog, SlidersHorizontal, SlidersVertical, Filter, FilterX,
    Search, SearchCheck, Maximize, Minimize,

    // Ações
    Download, Upload, Share, Share2, Link, Link2, ExternalLink, RefreshCw,
    RefreshCcw, RotateCw, RotateCcw, Repeat, Shuffle,

    // Mídia
    Image, ImagePlus, Images, Video, VideoOff, Mic, MicOff, Volume2, VolumeX,
    Play, Pause, SkipBack, SkipForward,

    // Formas e Símbolos
    Circle, Square, Triangle, Hexagon, Octagon, Pentagon, Diamond, Asterisk,
    Plus, Minus, X, Divide, Equal, Infinity,

    // Navegação
    Menu, List, ListOrdered, ListChecks, ListTodo, LayoutGrid, LayoutDashboard,
    MoreHorizontal, MoreVertical, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
    ChevronsRight, ChevronsLeft, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,

    // Esportes e Lazer
    Dumbbell, Gamepad2, Dice5, Puzzle, Weight,

    // Agricultura
    Tractor,

    // Religião
    Church,

    // Novos Ícones para Segmentos
    FlaskConical, TestTube, Microscope, Dna,
    Scissors, SprayCan, Brush as Brushes,
    Beer, Wine, GlassWater, Martini, Donut, IceCream, Popsicle, Beef,
    ToyBrick, Watch, Gem,
    Scroll,

    type LucideIcon,
} from 'lucide-react';

// Mapa de ícones disponíveis
export const iconMap: Record<string, LucideIcon> = {
    // ===== DOCUMENTOS E ARQUIVOS =====
    'file-text': FileText,
    'file-check': FileCheck,
    'file-plus': FilePlus,
    'file-search': FileSearch,
    'file-x': FileX,
    'file-clock': FileClock,
    'file-spreadsheet': FileSpreadsheet,
    'folder-open': FolderOpen,
    'folder-plus': FolderPlus,
    'folder-check': FolderCheck,
    'archive': Archive,
    'clipboard-check': ClipboardCheck,
    'clipboard-list': ClipboardList,
    'book-open': BookOpen,
    'book-marked': BookMarked,
    'book-user': BookUser,
    'book-heart': BookHeart,
    'notebook': Notebook,
    'notebook-pen': NotebookPen,

    // ===== FINANÇAS E TRIBUTOS =====
    'receipt': Receipt,
    'credit-card': CreditCard,
    'wallet': Wallet,
    'banknote': Banknote,
    'piggy-bank': PiggyBank,
    'dollar-sign': DollarSign,
    'circle-dollar-sign': CircleDollarSign,
    'coins': Coins,
    'hand-coins': HandCoins,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown,
    'bar-chart': BarChart3,
    'pie-chart': PieChart,
    'line-chart': LineChart,
    'calculator': Calculator,
    'percent': Percent,
    'landmark': Landmark,

    // ===== SAÚDE =====
    'heart-pulse': HeartPulse,
    'heart': Heart,
    'heart-handshake': HeartHandshake,
    'activity': Activity,
    'stethoscope': Stethoscope,
    'pill': Pill,
    'syringe': Syringe,
    'ambulance': Ambulance,
    'hospital': Hospital,
    'cross': Cross,
    'thermometer': Thermometer,
    'brain': Brain,
    'bone': Bone,
    'eye': Eye,
    'glasses': Glasses,
    'accessibility': Accessibility,
    'person-standing': PersonStanding,
    'baby': Baby,
    'smile': Smile,
    'frown': Frown,
    'bed': Bed,
    'armchair': Armchair,

    // ===== EDUCAÇÃO E CULTURA =====
    'graduation-cap': GraduationCap,
    'school': School,
    'library': Library,
    'pen-tool': PenTool,
    'pencil': Pencil,
    'palette': Palette,
    'paintbrush': Paintbrush,
    'music': Music,
    'music-2': Music2,
    'headphones': Headphones,
    'camera': Camera,
    'film': Film,
    'clapperboard': Clapperboard,
    'tv': Tv,
    'radio': Radio,
    'newspaper': Newspaper,
    'theater': Theater,
    'ticket': Ticket,
    'party-popper': PartyPopper,
    'sparkles': Sparkles,

    // ===== URBANISMO E OBRAS =====
    'building': Building,
    'building-2': Building2,
    'home': Home,
    'house': House,
    'hotel': Hotel,
    'factory': Factory,
    'warehouse': Warehouse,
    'construction': Construction,
    'hard-hat': HardHat,
    'ruler': Ruler,
    'hammer': Hammer,
    'wrench': Wrench,
    'shovel': Shovel,
    'drill': Drill,
    'brick-wall': BrickWall,
    'fence': Fence,
    'lightbulb': Lightbulb,
    'plug-zap': PlugZap,
    'plug': Plug,
    'cable': Cable,
    'circuit-board': CircuitBoard,
    'lamp': Lamp,
    'lamp-desk': LampDesk,

    // ===== TRANSPORTE E TRÂNSITO =====
    'car': Car,
    'car-front': CarFront,
    'truck': Truck,
    'bus': Bus,
    'train': Train,
    'train-front': TrainFront,
    'plane': Plane,
    'plane-takeoff': PlaneTakeoff,
    'ship': Ship,
    'sailboat': Sailboat,
    'anchor': Anchor,
    'bike': Bike,
    'footprints': Footprints,
    'navigation': Navigation,
    'map': Map,
    'map-pin': MapPin,
    'map-pinned': MapPinned,
    'compass': Compass,
    'route': Route,
    'signpost': Signpost,
    'traffic-cone': TrafficCone,
    'circle-parking': CircleParking,
    'fuel': Fuel,
    'gauge': Gauge,

    // ===== SEGURANÇA PÚBLICA =====
    'shield': Shield,
    'shield-check': ShieldCheck,
    'shield-alert': ShieldAlert,
    'shield-plus': ShieldPlus,
    'lock': Lock,
    'unlock': Unlock,
    'key': Key,
    'key-round': KeyRound,
    'fingerprint': Fingerprint,
    'scan-face': ScanFace,
    'alert-triangle': AlertTriangle,
    'alert-circle': AlertCircle,
    'alert-octagon': AlertOctagon,
    'siren': Siren,
    'flame': Flame,
    'fire-extinguisher': FireExtinguisher,
    'badge-check': BadgeCheck,
    'badge-alert': BadgeAlert,
    'user-check': UserCheck,
    'user-x': UserX,
    'flashlight': Flashlight,

    // ===== MEIO AMBIENTE =====
    'leaf': Leaf,
    'tree-pine': TreePine,
    'tree-deciduous': TreeDeciduous,
    'trees': Trees,
    'flower': Flower,
    'flower-2': Flower2,
    'sprout': Sprout,
    'apple': Apple,
    'cherry': Cherry,
    'grape': Grape,
    'carrot': Carrot,
    'wheat': Wheat,
    'recycle': Recycle,
    'trash-2': Trash2,
    'droplets': Droplets,
    'droplet': Droplet,
    'waves': Waves,
    'wind': Wind,
    'cloud-rain': CloudRain,
    'cloud-sun': CloudSun,
    'sun': Sun,
    'moon': Moon,
    'cloud': Cloud,
    'snowflake': Snowflake,
    'umbrella': Umbrella,
    'rainbow': Rainbow,
    'mountain': Mountain,
    'mountain-snow': MountainSnow,
    'tent': Tent,
    'palmtree': Palmtree,
    'fish': Fish,
    'bird': Bird,
    'bug': Bug,
    'rabbit': Rabbit,
    'turtle': Turtle,

    // ===== SOCIAL E CIDADANIA =====
    'users': Users,
    'users-round': UsersRound,
    'user-plus': UserPlus,
    'user-minus': UserMinus,
    'user': User,
    'user-circle': UserCircle,
    'contact': Contact,
    'handshake': Handshake,
    'hand-heart': HandHeart,
    'briefcase': Briefcase,
    'briefcase-medical': BriefcaseMedical,
    'scale': Scale,
    'gavel': Gavel,
    'vote': Vote,
    'megaphone': Megaphone,
    'message-square': MessageSquare,
    'messages-square': MessagesSquare,

    // ===== ASSISTÊNCIA SOCIAL E ALIMENTAÇÃO =====
    'gift': Gift,
    'shopping-basket': ShoppingBasket,
    'utensils': Utensils,
    'utensils-crossed': UtensilsCrossed,
    'cooking-pot': CookingPot,
    'soup': Soup,
    'coffee': Coffee,
    'cup-soda': CupSoda,
    'milk': Milk,
    'sandwich': Sandwich,
    'pizza': Pizza,
    'croissant': Croissant,
    'cake': Cake,
    'shirt': Shirt,
    'bath': Bath,
    'shower-head': ShowerHead,

    // ===== COMUNICAÇÃO =====
    'phone': Phone,
    'phone-call': PhoneCall,
    'phone-incoming': PhoneIncoming,
    'phone-outgoing': PhoneOutgoing,
    'smartphone': Smartphone,
    'tablet': Tablet,
    'laptop': Laptop,
    'monitor': Monitor,
    'mail': Mail,
    'mail-open': MailOpen,
    'mail-plus': MailPlus,
    'mail-check': MailCheck,
    'inbox': Inbox,
    'send': Send,
    'globe': Globe,
    'globe-2': Globe2,
    'wifi': Wifi,
    'wifi-off': WifiOff,
    'signal': Signal,
    'rss': Rss,
    'at-sign': AtSign,
    'hash': Hash,
    'message-circle': MessageCircle,
    'bell': Bell,
    'bell-ring': BellRing,

    // ===== SERVIÇOS PÚBLICOS =====
    'zap': Zap,
    'zap-off': ZapOff,
    'power': Power,
    'power-off': PowerOff,
    'battery': Battery,
    'battery-charging': BatteryCharging,
    'sunrise': Sunrise,
    'sunset': Sunset,

    // ===== COMÉRCIO E EMPREENDEDORISMO =====
    'shopping-cart': ShoppingCart,
    'shopping-bag': ShoppingBag,
    'store': Store,
    'package': Package,
    'package-open': PackageOpen,
    'package-check': PackageCheck,
    'package-plus': PackagePlus,
    'package-search': PackageSearch,
    'boxes': Boxes,
    'container': Container,
    'barcode': Barcode,
    'scan-barcode': ScanBarcode,
    'tag': Tag,
    'tags': Tags,
    'badge-percent': BadgePercent,
    'rocket': Rocket,
    'target': Target,
    'goal': Goal,
    'crosshair': Crosshair,
    'focus': Focus,

    // ===== STATUS E INFORMAÇÃO =====
    'info': Info,
    'help-circle': HelpCircle,
    'check-circle': CheckCircle,
    'check-circle-2': CheckCircle2,
    'x-circle': XCircle,
    'minus-circle': MinusCircle,
    'plus-circle': PlusCircle,
    'clock': Clock,
    'calendar': Calendar,
    'calendar-days': CalendarDays,
    'calendar-check': CalendarCheck,
    'calendar-plus': CalendarPlus,
    'calendar-clock': CalendarClock,
    'calendar-heart': CalendarHeart,
    'calendar-search': CalendarSearch,
    'timer': Timer,
    'timer-off': TimerOff,
    'hourglass': Hourglass,
    'history': History,
    'undo': Undo,
    'redo': Redo,

    // ===== CONQUISTAS =====
    'award': Award,
    'trophy': Trophy,
    'medal': Medal,
    'crown': Crown,
    'star': Star,
    'star-half': StarHalf,
    'flag': Flag,
    'thumbs-up': ThumbsUp,
    'thumbs-down': ThumbsDown,
    'verified': Verified,
    'circle-check': CircleCheck,

    // ===== TECNOLOGIA =====
    'database': Database,
    'server': Server,
    'hard-drive': HardDrive,
    'usb': Usb,
    'bluetooth': Bluetooth,
    'qr-code': QrCode,
    'scan': Scan,
    'scan-line': ScanLine,
    'printer': Printer,
    'code': Code,
    'code-2': Code2,
    'terminal': Terminal,
    'binary': Binary,

    // ===== CONFIGURAÇÕES =====
    'settings': Settings,
    'settings-2': Settings2,
    'cog': Cog,
    'sliders-horizontal': SlidersHorizontal,
    'sliders-vertical': SlidersVertical,
    'filter': Filter,
    'filter-x': FilterX,
    'search': Search,
    'search-check': SearchCheck,
    'maximize': Maximize,
    'minimize': Minimize,

    // ===== AÇÕES =====
    'download': Download,
    'upload': Upload,
    'share': Share,
    'share-2': Share2,
    'link': Link,
    'link-2': Link2,
    'external-link': ExternalLink,
    'refresh-cw': RefreshCw,
    'refresh-ccw': RefreshCcw,
    'rotate-cw': RotateCw,
    'rotate-ccw': RotateCcw,
    'repeat': Repeat,
    'shuffle': Shuffle,

    // ===== MÍDIA =====
    'image': Image,
    'image-plus': ImagePlus,
    'images': Images,
    'video': Video,
    'video-off': VideoOff,
    'mic': Mic,
    'mic-off': MicOff,
    'volume-2': Volume2,
    'volume-x': VolumeX,
    'play': Play,
    'pause': Pause,
    'skip-back': SkipBack,
    'skip-forward': SkipForward,

    // ===== FORMAS =====
    'circle': Circle,
    'square': Square,
    'triangle': Triangle,
    'hexagon': Hexagon,
    'octagon': Octagon,
    'pentagon': Pentagon,
    'diamond': Diamond,
    'asterisk': Asterisk,
    'plus': Plus,
    'minus': Minus,
    'x': X,
    'divide': Divide,
    'equal': Equal,
    'infinity': Infinity,

    // ===== NAVEGAÇÃO =====
    'menu': Menu,
    'list': List,
    'list-ordered': ListOrdered,
    'list-checks': ListChecks,
    'list-todo': ListTodo,
    'layout-grid': LayoutGrid,
    'layout-dashboard': LayoutDashboard,
    'more-horizontal': MoreHorizontal,
    'more-vertical': MoreVertical,
    'chevron-right': ChevronRight,
    'chevron-left': ChevronLeft,
    'chevron-down': ChevronDown,
    'chevron-up': ChevronUp,
    'chevrons-right': ChevronsRight,
    'chevrons-left': ChevronsLeft,
    'arrow-right': ArrowRight,
    'arrow-left': ArrowLeft,
    'arrow-up': ArrowUp,
    'arrow-down': ArrowDown,

    // ===== ESPORTES E LAZER =====
    'dumbbell': Dumbbell,
    'gamepad': Gamepad2,
    'dice': Dice5,
    'puzzle': Puzzle,

    // ===== AGRICULTURA =====
    'tractor': Tractor,

    // ===== RELIGIÃO =====
    'church': Church,

    // ===== NOVOS SEGMENTOS =====
    // Saúde (Lab, Odonto, Academia)
    // 'first-aid': FirstAid, // Helper: FirstAid might be missing in basic Lucide set, verify
    'flask-conical': FlaskConical,
    'test-tube': TestTube,
    'microscope': Microscope,
    'dna': Dna,
    'weight': Weight,
    //'biceps-flex': BicepsFlex, 

    // Beleza e Estética
    'scissors': Scissors,
    'spray-can': SprayCan,
    'brushes': Brushes,

    // Alimentação e Bebidas
    'beer': Beer,
    'wine': Wine,
    'glass-water': GlassWater,
    'martini': Martini,
    'donut': Donut,
    'ice-cream': IceCream,
    'popsicle': Popsicle,
    'beef': Beef,

    // Varejo e Kids
    'toy-brick': ToyBrick,
    'watch': Watch,
    'gem': Gem,
    'sofa': Armchair, // Mapping sofa to Armchair as before unless Sofa exists

    // Serviços e Profissional
    'scroll': Scroll,
};

// Mapa de termos de busca em PT-BR para facilitar a localização
export const searchTermsMap: Record<string, string[]> = {
    // Documentos
    'file-text': ['arquivo', 'texto', 'documento', 'folha', 'papel'],
    'file-check': ['arquivo', 'verificado', 'aprovado', 'checklist'],
    'file-plus': ['novo', 'adicionar', 'criar', 'arquivo'],
    'folder-open': ['pasta', 'diretório', 'abrir'],

    // Finanças
    'receipt': ['recibo', 'nota', 'fiscal', 'comprovante'],
    'credit-card': ['cartão', 'crédito', 'débito', 'pagamento'],
    'wallet': ['carteira', 'dinheiro', 'bolso'],
    'banknote': ['cédula', 'dinheiro', 'pagamento', 'nota'],
    'piggy-bank': ['cofrinho', 'economia', 'poupança'],
    'dollar-sign': ['dólar', 'dinheiro', 'moeda', 'valor', 'preço', 'custo'],
    'circle-dollar-sign': ['dólar', 'dinheiro', 'moeda', 'valor'],

    // Saúde
    'heart': ['coração', 'saúde', 'vida', 'amor'],
    'heart-pulse': ['batimento', 'cardíaco', 'saúde', 'pulso'],
    'stethoscope': ['estetoscópio', 'médico', 'consulta', 'exame'],
    'hospital': ['hospital', 'clínica', 'saúde', 'prédio'],
    'ambulance': ['ambulância', 'emergência', 'resgate'],
    'pill': ['pílula', 'remédio', 'medicamento'],

    // Educação
    'graduation-cap': ['formatura', 'graduação', 'escola', 'faculdade', 'curso'],
    'school': ['escola', 'colégio', 'educação', 'prédio'],
    'book-open': ['livro', 'ler', 'estudo', 'leitura'],
    'pencil': ['lápis', 'escrever', 'editar'],

    // Ações
    'search': ['buscar', 'pesquisar', 'procurar', 'lupa', 'encontrar'],
    'settings': ['configurações', 'ajustes', 'engrenagem', 'opções'],
    'user': ['usuário', 'pessoa', 'perfil', 'conta', 'avatar'],
    'download': ['baixar', 'download', 'salvar', 'arquivo'],
    'upload': ['enviar', 'upload', 'subir', 'arquivo'],
    'trash-2': ['lixo', 'lixeira', 'remover', 'excluir', 'deletar'],
    'edit': ['editar', 'alterar', 'modificar', 'lápis'],
    'check': ['ok', 'confirma', 'concluir', 'feito', 'sucesso'],
    'x': ['fechar', 'cancelar', 'remover', 'erro'],
    'plus': ['adicionar', 'mais', 'novo', 'criar'],
    'minus': ['menos', 'remover', 'diminuir'],

    // Comunicação
    'mail': ['email', 'correio', 'mensagem', 'carta'],
    'phone': ['telefone', 'ligar', 'contato', 'celular'],
    'message-circle': ['mensagem', 'chat', 'conversa', 'balão'],
    'send': ['enviar', 'mandar', 'avião'],

    // Tecnologia
    'database': ['banco', 'dados', 'armazenamento', 'servidor'],
    'server': ['servidor', 'rack', 'hospedagem'],
    'wifi': ['internet', 'rede', 'sem fio', 'conexão'],

    // Tempo
    'calendar': ['calendário', 'data', 'agenda', 'dia'],
    'clock': ['relógio', 'tempo', 'hora', 'horário'],

    // Outros
    'home': ['casa', 'início', 'principal', 'dashboard'],
    'map-pin': ['local', 'mapa', 'ponteiro', 'endereço', 'localização'],
    'star': ['estrela', 'favorito', 'destaque', 'importante'],
    'filter': ['filtro', 'filtrar', 'funil'],
    'lock': ['cadeado', 'trancar', 'segurança', 'privado', 'senha'],
    // Novos Segmentos
    'flask-conical': ['laboratório', 'ciência', 'química', 'exame'],
    'test-tube': ['tubo', 'ensaio', 'laboratório', 'exame'],
    'microscope': ['microscópio', 'laboratório', 'pesquisa'],
    'dna': ['dna', 'genética', 'biologia'],
    'weight': ['peso', 'academia', 'musculação', 'dieta'],
    'scissors': ['tesoura', 'corte', 'cabelo', 'barbearia', 'beleza'],
    'spray-can': ['spray', 'tinta', 'beleza', 'cabelo'],
    'brushes': ['pincel', 'maquiagem', 'arte', 'beleza'],
    'beer': ['cerveja', 'bar', 'bebida', 'álcool'],
    'wine': ['vinho', 'taça', 'bebida', 'bar', 'restaurante'],
    'glass-water': ['água', 'copo', 'bebida'],
    'martini': ['martini', 'drink', 'coquetel', 'bar'],
    'donut': ['rosquinha', 'doce', 'confeitaria', 'padaria'],
    'ice-cream': ['sorvete', 'doce', 'sobremesa'],
    'popsicle': ['picolé', 'sorvete', 'doce'],
    'beef': ['carne', 'açougue', 'boi', 'churrasco'],
    'toy-brick': ['brinquedo', 'lego', 'criança', 'infantil'],
    'watch': ['relógio', 'pulso', 'acessório', 'tempo'],
    'gem': ['joia', 'diamante', 'pedra', 'valor'],
    'sofa': ['poltrona', 'sofá', 'móvel', 'conforto', 'casa'],
    'scroll': ['pergaminho', 'contrato', 'documento', 'história', 'advocacia'],
};

// Lista de ícones organizados por categoria para o seletor - 20+ categorias
export const iconCategories = [
    {
        name: 'Documentos',
        icons: ['file-text', 'file-check', 'file-plus', 'file-search', 'file-x', 'file-clock', 'file-spreadsheet', 'folder-open', 'folder-plus', 'folder-check', 'archive', 'clipboard-check', 'clipboard-list', 'book-open', 'book-marked', 'book-user', 'notebook', 'notebook-pen'],
    },
    {
        name: 'Finanças e Tributos',
        icons: ['receipt', 'credit-card', 'wallet', 'banknote', 'piggy-bank', 'dollar-sign', 'circle-dollar-sign', 'coins', 'hand-coins', 'trending-up', 'trending-down', 'bar-chart', 'pie-chart', 'line-chart', 'calculator', 'percent', 'landmark'],
    },
    {
        name: 'Saúde',
        icons: ['heart-pulse', 'heart', 'heart-handshake', 'activity', 'stethoscope', 'pill', 'syringe', 'ambulance', 'hospital', 'cross', 'thermometer', 'brain', 'bone', 'eye', 'glasses', 'accessibility', 'person-standing', 'baby', 'smile', 'frown', 'bed', 'armchair'],
    },
    {
        name: 'Educação e Cultura',
        icons: ['graduation-cap', 'school', 'library', 'pen-tool', 'pencil', 'palette', 'paintbrush', 'music', 'music-2', 'headphones', 'camera', 'film', 'clapperboard', 'tv', 'radio', 'newspaper', 'theater', 'ticket', 'party-popper', 'sparkles'],
    },
    {
        name: 'Obras e Urbanismo',
        icons: ['building', 'building-2', 'home', 'house', 'hotel', 'factory', 'warehouse', 'construction', 'hard-hat', 'ruler', 'hammer', 'wrench', 'shovel', 'drill', 'brick-wall', 'fence', 'lightbulb', 'plug-zap', 'plug', 'cable', 'circuit-board', 'lamp', 'lamp-desk'],
    },
    {
        name: 'Transporte e Trânsito',
        icons: ['car', 'car-front', 'truck', 'bus', 'train', 'train-front', 'plane', 'plane-takeoff', 'ship', 'sailboat', 'anchor', 'bike', 'footprints', 'navigation', 'map', 'map-pin', 'map-pinned', 'compass', 'route', 'signpost', 'traffic-cone', 'circle-parking', 'fuel', 'gauge'],
    },
    {
        name: 'Segurança Pública',
        icons: ['shield', 'shield-check', 'shield-alert', 'shield-plus', 'lock', 'unlock', 'key', 'key-round', 'fingerprint', 'scan-face', 'alert-triangle', 'alert-circle', 'alert-octagon', 'siren', 'flame', 'fire-extinguisher', 'badge-check', 'badge-alert', 'user-check', 'user-x', 'flashlight'],
    },
    {
        name: 'Meio Ambiente',
        icons: ['leaf', 'tree-pine', 'tree-deciduous', 'trees', 'flower', 'flower-2', 'sprout', 'apple', 'cherry', 'grape', 'carrot', 'wheat', 'recycle', 'trash-2', 'droplets', 'droplet', 'waves', 'wind', 'cloud-rain', 'cloud-sun', 'sun', 'moon', 'cloud', 'snowflake', 'umbrella', 'rainbow', 'mountain', 'mountain-snow', 'tent', 'palmtree'],
    },
    {
        name: 'Fauna',
        icons: ['fish', 'bird', 'bug', 'rabbit', 'turtle', 'dog', 'cat', 'paw-print'],
    },
    {
        name: 'Social e Cidadania',
        icons: ['users', 'users-round', 'user-plus', 'user-minus', 'user', 'user-circle', 'contact', 'handshake', 'hand-heart', 'briefcase', 'briefcase-medical', 'scale', 'gavel', 'vote', 'megaphone', 'message-square', 'messages-square'],
    },
    {
        name: 'Assistência Social',
        icons: ['gift', 'shopping-basket', 'utensils', 'utensils-crossed', 'cooking-pot', 'soup', 'coffee', 'cup-soda', 'milk', 'sandwich', 'pizza', 'croissant', 'cake', 'shirt', 'bath', 'shower-head'],
    },
    {
        name: 'Comunicação',
        icons: ['phone', 'phone-call', 'phone-incoming', 'phone-outgoing', 'smartphone', 'tablet', 'laptop', 'monitor', 'mail', 'mail-open', 'mail-plus', 'mail-check', 'inbox', 'send', 'globe', 'globe-2', 'wifi', 'wifi-off', 'signal', 'rss', 'at-sign', 'hash', 'message-circle', 'bell', 'bell-ring'],
    },
    {
        name: 'Serviços Públicos',
        icons: ['zap', 'zap-off', 'power', 'power-off', 'battery', 'battery-charging', 'sunrise', 'sunset', 'trash-2', 'map-pin', 'map', 'navigation', 'compass'],
    },
    {
        name: 'Empreendedorismo',
        icons: ['shopping-cart', 'shopping-bag', 'store', 'package', 'package-open', 'package-check', 'package-plus', 'package-search', 'boxes', 'container', 'barcode', 'scan-barcode', 'tag', 'tags', 'badge-percent', 'rocket', 'target', 'goal', 'crosshair', 'focus'],
    },
    {
        name: 'Agenda e Tempo',
        icons: ['clock', 'calendar', 'calendar-days', 'calendar-check', 'calendar-plus', 'calendar-clock', 'calendar-heart', 'calendar-search', 'timer', 'timer-off', 'hourglass', 'history'],
    },
    {
        name: 'Status',
        icons: ['info', 'help-circle', 'check-circle', 'check-circle-2', 'x-circle', 'minus-circle', 'plus-circle', 'alert-triangle', 'alert-circle'],
    },
    {
        name: 'Conquistas',
        icons: ['award', 'trophy', 'medal', 'crown', 'star', 'star-half', 'flag', 'thumbs-up', 'thumbs-down', 'verified', 'circle-check'],
    },
    {
        name: 'Tecnologia',
        icons: ['database', 'server', 'hard-drive', 'usb', 'bluetooth', 'qr-code', 'scan', 'scan-line', 'printer', 'code', 'code-2', 'terminal', 'binary'],
    },
    {
        name: 'Esportes e Lazer',
        icons: ['dumbbell', 'bike', 'gamepad', 'dice', 'puzzle', 'tent', 'mountain'],
    },
    {
        name: 'Agricultura',
        icons: ['tractor', 'wheat', 'sprout', 'apple', 'carrot', 'grape', 'cherry', 'leaf'],
    },
    {
        name: 'Religião',
        icons: ['church', 'cross', 'heart', 'hand-heart'],
    },
    {
        name: 'Beleza e Estética',
        icons: ['scissors', 'spray-can', 'brushes', 'mirror', 'sparkles'],
    },
    {
        name: 'Gastronomia e Bebidas',
        icons: ['utensils', 'utensils-crossed', 'cooking-pot', 'soup', 'coffee', 'cup-soda', 'milk', 'beer', 'wine', 'glass-water', 'martini', 'pizza', 'sandwich', 'croissant', 'cake', 'donut', 'ice-cream', 'popsicle', 'beef'],
    },
    {
        name: 'Laboratório e Ciência',
        icons: ['flask-conical', 'test-tube', 'microscope', 'dna', 'thermometer', 'activity'],
    },
];

// Componente para renderizar ícone dinamicamente
interface DynamicIconProps {
    name: string;
    className?: string;
    size?: number | string;
    style?: React.CSSProperties;
}

export function DynamicIcon({ name, className = '', size = 20, style }: DynamicIconProps) {
    let IconComponent = iconMap[name];

    // Fallback: Try converting PascalCase to kebab-case (e.g. ShoppingBasket -> shopping-basket)
    if (!IconComponent) {
        const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        IconComponent = iconMap[kebabName];
    }

    // Fallback 2: Try converting strict lowercase (e.g. Utensils -> utensils)
    if (!IconComponent) {
        IconComponent = iconMap[name.toLowerCase()];
    }

    if (!IconComponent) {
        // Fallback final: tenta renderizar como emoji ou texto
        return <span className={className} style={{ fontSize: size, ...style }}>{name}</span>;
    }

    return <IconComponent className={className} size={size} style={style} />;
}

// Helper para obter nome legível do ícone
export function getIconLabel(iconName: string): string {
    return iconName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
